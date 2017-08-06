module.exports = function (context, myQueueItem) {
    context.log('JavaScript queue trigger function processed work item', myQueueItem);


    //Set up Azure Storage credentials
    const azure = require('azure-storage');
    const tableSvc = azure.createTableService(process.env.azurestoragename, process.env.azurestoragekey);
    const vindexer = require("video-indexer");
    const Vindexer = new vindexer(process.env.videoindexerkey);

    const query = new azure.TableQuery().where('VTT eq ?', '');
    let videoresult = '';
    let vttresult = '';
    let currPK = '';
    let currRK = '';

    // Vindexer.search({
    //     // Optional
    //     language: 'English',
    //     searchInPublicAccount: false
    // })
    // .then(function(result){ 
    //     videoresult = JSON.parse(result.body)
    //     context.log(`first video breakdown id: ${videoresult.results[1].id}`);
    //     Vindexer.getVttUrl(videoresult.results[1].id).then(function (result){ context.log(`VTT URL: ${result.body}`); });
    // })

    tableSvc.queryEntities('bluescreenofdeath', query, null, function (error, result, response) {
        if (!error) {
            context.log(result)
            for (i = 0; i < result.entries.length; i++) {
                context.log(result.entries[i].url._);
                currPK = result.entries[i].PartitionKey._;
                currRK = result.entries[i].RowKey._;
                Vindexer.uploadVideo(result.entries[i].url._, {
                    name: currPK + currRK,
                    privacy: 'Private',
                    language: 'English'
                })
                    .then(function(response) {
                        videoresult = JSON.parse(response.body)
                        context.log(`return from previous call: ${videoresult}`)
                        Vindexer.getVttUrl(videoresult)
                    })
                    .then(function(response) {
                        vttresult = JSON.parse(response.body)
                        tableSvc.mergeEntity('bluescreenofdeath', { PartitionKey: currPK, RowKey: currRK, VTT: vttresults }, { echoContent: true }, function (error, result, response) {
                             context.log(`vtt updated`);
                        })
                    });
            }
        }
        else { context.log(`error`); }
    });

    context.done();
};
