"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

var LUISRECOG = new builder.LuisRecognizer(process.env['LuisEndpoint']);

var intents = new builder.IntentDialog({ recognizer: LUISRECOG });

bot.dialog('/', intents);

intents.matches('GetFood', 'GetFood');

bot.dialog('GetFood', [
    (session, args, next) => {
        var searchCuisine = builder.EntityRecognizer.findAllEntities(args.entities, 'Cuisine');
        var listOfCuisines = (function () {
            var cuisines = []
            for (var idx = 0; idx < searchCuisine.length; idx++) {
                cuisines.push(searchCuisine[idx]['entity']);
            }
            return cuisines;
        })();
        session.say('You talked about' + listOfCuisines[0], 'You mentioned ' + listOfCuisines[0]);
        session.endConversation();
    }
]);

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}
