'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.io = undefined;

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _cors = require('cors');

var _cors2 = _interopRequireDefault(_cors);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _graphqlServerExpress = require('graphql-server-express');

var _base_dao = require('./dao/base_dao');

var _schema = require('./schema');

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//数据库dao
/**
 * Created by zhubg on 2017/2/14.
 */

var app = (0, _express2.default)();

// import path from 'path';
// app.use('/download',express.static(path.join(__dirname, '../dist')));

//WsServer
var WsServer = require('http').createServer(app);
var io = exports.io = require('socket.io')(WsServer);

require('socketio-auth')(io, {
    authenticate: function authenticate(socket, data, callback) {
        //get credentials sent by the client
        var params = {};
        console.log(arguments[1]);
        if (data.accountName && data.token) {
            params.accountName = data.accountName;
            return (0, _base_dao.baseDao)('user', 'getUserByAccountName', params).then(function (obj) {
                if (obj[0] && obj[0].token === data.token) {
                    console.log("authenticate： " + (obj[0].token === data.token));
                    socket.join("room1");
                    return callback(null, true);
                } else {
                    console.log("非法连接，用户名口令不正确");
                    return callback(new Error("非法连接，用户名口令不正确"));
                }
            }).catch(function (e) {
                console.log(e);
                return callback(new Error("数据库连接失败"));
            });
        } else {
            console.log("非法连接，用户名口令为空");
            return callback(new Error("非法连接，用户名口令为空"));
        }
    }
});

io.on('connection', function (socket) {
    console.log('a user connected');
    console.log(socket.id);
    // socket.disconnect();
    //接受消息
    socket.on('message', function (msg) {
        console.log('receive messge : ' + msg);
    });

    //断开连接回调
    socket.on('disconnect', function () {
        console.log('socket disconnect');
    });
});

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

//test


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

app.get('/login', function (req, res, next) {
    (0, _nodeFetch2.default)('http://localhost:3000/graphql', {
        method: 'POST',
        body: JSON.stringify({
            "query": 'query {\n                              loginUser(accountName:"wangwang1",password:"123456") {\n                                token\n                              }\n                            }'
        }),
        headers: { 'Content-Type': 'application/json' }
    }).then(function (res) {
        return res.json();
    }).then(function (json) {
        console.log(json);
        res.send(json);
    });
});

app.get('/submit', function (req, res, next) {
    (0, _nodeFetch2.default)('http://localhost:3000/graphql', {
        method: 'POST',
        body: JSON.stringify({
            "query": 'mutation {\n                              submitUser(\n                                            accountName:"wangwang1",\n                                            nickName:"\u963F\u5F3A",\n                                            password:"123456",\n                                            phone:"18521566919",\n                                            qqNumber:"manager",\n                                            invitationCode:"rightInvitationCode"\n                              ){\n                                message\n                              } \n                            }'
        }),
        headers: { 'Content-Type': 'application/json' }
    }).then(function (res) {
        return res.json();
    }).then(function (json) {
        console.log(json);
        res.send(json);
    });
});

app.get('/test1', function (req, res, next) {
    var accountName = "wangwang1";
    var token = "dca4f4aff4b6d06cedde";
    var content = "大10000 大双10000 双10000  17草10000  18草10000  19草10000  极大10000  豹子10000  顺子10000  对子10000";
    var Test_Query = 'query {\n                              newMessage(accountName:"' + accountName + '",token:"' + token + '",content:"' + content + '") {\n                                message\n                              }\n                            }';
    (0, _nodeFetch2.default)('http://localhost:3000/graphql', {
        method: 'POST',
        body: JSON.stringify({
            "query": Test_Query
        }),
        headers: { 'Content-Type': 'application/json' }
    }).then(function (res) {
        return res.json();
    }).then(function (json) {
        console.log(json);
        res.send(json);
    });
});

app.get('/test', function (req, res) {
    //发送消息
    io.to('room1').emit('some event', '999');
    res.send('成功');
});

app.get('/test5', function (req, res) {
    //发送消息
    console.log(globalSockets.length);
    res.send("nice");
});

app.use('/graphql', (0, _cors2.default)(corsOptions), _bodyParser2.default.json(), (0, _graphqlServerExpress.graphqlExpress)({ schema: _schema.schema }));

app.listen(3000, function () {
    console.log('Running a GraphQL API server at localhost:3000/graphql');
});
WsServer.listen(3001, function () {
    console.log('Running a WS server at localhost:3001');
});