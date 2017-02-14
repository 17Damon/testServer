'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _graphqlServerExpress = require('graphql-server-express');

var _schema = require('./schema');

var _subScription = require('./subScription');

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express2.default)();

//test
/**
 * Created by zhubg on 2017/2/14.
 */

var corsOptions = {
    // origin: 'http://192.168.0.104:8989',
    origin: function origin(_origin, callback) {
        // var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        var originIsWhitelisted = true;
        callback(originIsWhitelisted ? null : 'Bad Request', originIsWhitelisted);
    },
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.get('/tokentest', function (req, res, next) {
    (0, _nodeFetch2.default)('http://localhost:3000/graphql', {
        method: 'POST',
        body: JSON.stringify({
            "query": 'query {\n                              getToken(id:"1234") {\n                                token\n                              }\n                            }'
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
    // subscriptionManager.subscribe({
    //     query: `
    //     subscription NewMessageSubscription {
    //       newMessage
    //     }
    //   `,
    //     callback: (err, result) =>
    //         console.log(result)
    // });
    _subScription.pubsub.publish('newMessage', 'Hello, world!');
    console.log(_subScription.pubsub);
});

app.use('/graphql', (0, _cors2.default)(corsOptions), _bodyParser2.default.json(), (0, _graphqlServerExpress.graphqlExpress)({ schema: _schema.schema }));

app.listen(3000, function () {
    console.log('Running a GraphQL API server at localhost:3000/graphql');
});