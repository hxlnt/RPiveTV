module.exports = function (context, myQueueItem) {
    context.log('JavaScript queue trigger function processed work item', myQueueItem);
    
    
    //Set up Azure Storage credentials
    var azure = require('azure-storage')
    var tableSvc = azure.createTableService(process.env.azurestoragename, process.env.azurestoragekey)

    var query = new azure.TableQuery().where('VTT eq ?', '');
    
    tableSvc.queryEntities('bluescreenofdeath', query, null, function(error, result, response) {
        if(!error) {
            context.log(result.entries)
            for (i=0; i<result.entries.length; i++) {
                
            }
        }
        else { context.log(`error`); }
    });
    
    context.done();
};
