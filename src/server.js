/**
 * Created by zhubg on 2017/2/14.
 */

import express from 'express';
import cors from 'cors';
import bodyParser from'body-parser';
import { graphqlExpress } from 'graphql-server-express';
import {schema} from'./schema';
import { pubsub ,subscriptionManager } from './subScription';

//test
import fetch from 'node-fetch';

var app = express();
var corsOptions = {
    // origin: 'http://192.168.0.104:8989',
    origin: function (origin, callback) {
        // var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        var originIsWhitelisted = true;
        callback(originIsWhitelisted ? null : 'Bad Request', originIsWhitelisted);
    },
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

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
    // subscriptionManager.subscribe({
    //     query: `
    //     subscription NewMessageSubscription {
    //       newMessage
    //     }
    //   `,
    //     callback: (err, result) =>
    //         console.log(result)
    // });
    pubsub.publish('newMessage', 'Hello, world!');
    console.log(pubsub);
});

app.use('/graphql', cors(corsOptions), bodyParser.json(), graphqlExpress({ schema: schema }));

app.listen(3000, () => {
    console.log('Running a GraphQL API server at localhost:3000/graphql');
});
