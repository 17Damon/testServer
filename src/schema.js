import { makeExecutableSchema } from 'graphql-tools';

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
export const schema = makeExecutableSchema({ typeDefs, resolvers });
