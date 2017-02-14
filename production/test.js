'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var express = require('express');
var bodyParser = require('body-parser');
var fetch = require('node-fetch');

var _require = require('graphql-server-express'),
    graphqlExpress = _require.graphqlExpress;

var PORT = 3000;
var app = express();

// npm install graphql graphql-tools graphql-subscriptions

var _require2 = require('graphql-subscriptions'),
    PubSub = _require2.PubSub,
    SubscriptionManager = _require2.SubscriptionManager;

var _require3 = require('graphql-tools'),
    makeExecutableSchema = _require3.makeExecutableSchema;

// Our "database"


var messages = [];

// Minimal schema
var typeDefs = '\ntype Token {\n    token: String!\n}\ntype Query {\n    getToken(id:ID!): Token\n\n}\ntype Subscription {\n  newMessage: String!\n}\n';

var Token = function Token(token) {
    _classCallCheck(this, Token);

    this.token = token;
};

// Minimal resolvers


var resolvers = {
    Query: {
        getToken: function getToken(id) {
            var token = require('crypto').randomBytes(10).toString('hex');
            console.log("token_test");
            console.log(token);
            return new Token(token);
        }
    },
    // This just passes through the pubsub message contents
    Subscription: {
        newMessage: function newMessage(rootValue) {
            console.log("rootValue: " + rootValue);
            return rootValue;
        }
    }
};

// Use graphql-tools to make a GraphQL.js schema
// const schema = makeExecutableSchema({ typeDefs, resolvers });

var _require4 = require('./schema'),
    schema = _require4.schema;

// Initialize GraphQL subscriptions


var pubsub = new PubSub();
var subscriptionManager = new SubscriptionManager({ schema: schema, pubsub: pubsub });

// Run a subscription
// subscriptionManager.subscribe({
//     query: `
//     subscription NewMessageSubscription {
//       newMessage
//     }
//   `,
//     callback: (err, result) =>
//         console.log(result),
// });

// Create a message
// const helloWorldMessage = 'Hello, world!';

// Add it to "database"
// messages.push(helloWorldMessage);

// Push it over pubsub, this could be replaced with Redis easily
// pubsub.publish('newMessage', 'Hello, world!');
// pubsub.publish('newMessage', 'Hello, world2!');


app.get('/tokentest', function (req, res, next) {
    fetch('http://localhost:3000/graphql', {
        method: 'POST',
        body: JSON.stringify({
            "query": 'query {\n                               getToken(id:"1234") {\n                                token\n                              }\n                            }'
        }),
        headers: { 'Content-Type': 'application/json' }
    }).then(function (res) {
        return res.json();
    }).then(function (json) {
        console.log(json);
        res.send(json);
    });
});

app.get('/test', function (req, res, next) {
    subscriptionManager.subscribe({
        query: '\n        subscription NewMessageSubscription {\n          newMessage\n        }   \n      ',
        callback: function callback(err, result) {
            return console.log(result);
        }
    });
    pubsub.publish('newMessage', 'Hello, world!');
});

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: schema }));

app.listen(PORT);