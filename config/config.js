module.exports = {
    websiteProperties: {
        url: 'http://localhost:3000'
    },
    dbChoice: {
        local: false  // this switches between local and AzureDocDB options below
    },

    dbProperties: {
        local: {
            //uncomment for docker using docker-compose yml configuration
            uri: 'mongodb://localhost/arivale',
            mainConnectionUri: 'mongodb://localhost/arivale', // main connection that holds openspace data
            
        },
    },


    scope: {
        Admin: 'Admin',
        Coach:'Coach',
        Client: 'Client'
    }
};