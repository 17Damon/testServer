const express = require( 'express');
const bodyParser = require( 'body-parser');
const fetch = require('node-fetch');
const { graphqlExpress } = require( 'graphql-server-express');

const PORT = 3000;
var app = express();

// npm install graphql graphql-tools graphql-subscriptions
const { PubSub, SubscriptionManager } = require('graphql-subscriptions');
const { makeExecutableSchema } = require('graphql-tools');

// Our "database"
const messages = [];

// Minimal schema
const typeDefs = `
type Token {
    token: String!
}
type Query {
    getToken(id:ID!): Token

}
type Subscription {
  newMessage: String!
}
`;

class Token {
    constructor(token) {
        this.token = token;
    }
}

// Minimal resolvers
const resolvers = {
    Query: {
        getToken(id) {
            let token = require('crypto').randomBytes(10).toString('hex');
            console.log("token_test");
            console.log(token);
            return new Token(token);
        }
    },
    // This just passes through the pubsub message contents
    Subscription: {
        newMessage(rootValue){
            console.log("rootValue: "+rootValue);
            return rootValue;
        }
    }
};

// Use graphql-tools to make a GraphQL.js schema
// const schema = makeExecutableSchema({ typeDefs, resolvers });
const {schema} = require( './schema');

// Initialize GraphQL subscriptions
const pubsub = new PubSub();
const subscriptionManager = new SubscriptionManager({ schema, pubsub });

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
        body: JSON.stringify(
            {
                "query": `query {
                               getToken(id:"1234") {
                                token
                              }
                            }`
            }
        ),
        headers: {'Content-Type': 'application/json'}
    })
        .then(function (res) {
            return res.json();
        }).then(function (json) {
        console.log(json);
        res.send(json);
    });
});


app.get('/test', function (req, res, next) {
    subscriptionManager.subscribe({
        query: `
        subscription NewMessageSubscription {
          newMessage
        }   
      `,
        callback: (err, result) =>
            console.log(result)
    });
    pubsub.publish('newMessage', 'Hello, world!');
});

app.use('/graphql', bodyParser.json(), graphqlExpress({ schema: schema }));

app.listen(PORT);