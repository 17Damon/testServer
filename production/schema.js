'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.schema = undefined;

var _graphqlTools = require('graphql-tools');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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
var schema = exports.schema = (0, _graphqlTools.makeExecutableSchema)({ typeDefs: typeDefs, resolvers: resolvers });