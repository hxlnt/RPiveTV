module.exports = function (context, myQueueItem) {
    context.log('JavaScript queue trigger function processed work item', myQueueItem);


    //Set up Azure Storage credentials
    const azure = require('azure-storage');
    const tableSvc = azure.createTableService(process.env.azurestoragename, process.env.azurestoragekey);
    const vindexer = require("video-indexer");
    const Vindexer = new vindexer(process.env.videoindexerkey);

    const query = new azure.TableQuery().where('VTT eq ?', '');
    let videoresult = '';

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
            // videoresult = JSON.parse(result.body)
            context.log(result)
            for (i = 0; i < result.entries.length; i++) {
                context.log(result.entries[i].url._)
                Vindexer.uploadVideo(result.entries[i].url._, {
                    name: result.entries[i].RowKey._ + result.entries[i].RowKey._,
                    privacy: 'Private',
                    language: 'English'
                })
                    //.then(Vindexer.getVttUrl(result.body))
                    .then(tableSvc.mergeEntity('bluescreenofdeath', { VTT: "test" }, { echoContent: true }, function (error, result, response) {
                        context.log(`vtt updated`);
                    })
                );
            }
        }
        else { context.log(`error`); }
    });

    context.done();
};
