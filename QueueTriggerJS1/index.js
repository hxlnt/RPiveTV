module.exports = function (context, myQueueItem) {
    context.log('JavaScript queue trigger function processed work item', myQueueItem);

    //Set up Azure credentials
    const azure = require('azure-storage');
    const tableSvc = azure.createTableService(process.env.azurestoragename, process.env.azurestoragekey);
    const vindexer = require("video-indexer");
    const Vindexer = new vindexer(process.env.videoindexerkey);

    const query = new azure.TableQuery().where('VTT eq ?', '');
    let videoresult = '';
    let vttresult = '';
    let currPK = '';
    let currRK = '';

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
                        Vindexer.getVttUrl(videoresult).then(function(response2) {
                            vttresult = JSON.parse(response2.body)
                            context.log(`vtt result: ${vttresult}`)
                            tableSvc.mergeEntity('bluescreenofdeath', { PartitionKey: currPK, RowKey: currRK, VTT: vttresult }, { echoContent: true }, function (error, result, response) {
                                context.log(`vtt updated`);
                            })
                        });
                    })  
            }
        }
        else { context.log(`error`); }
    });

    context.done();
};
