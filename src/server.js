/**
 * Created by zhubg on 2017/3/6.
 */

import express from 'express';
import cors from 'cors';
import bodyParser from'body-parser';
import {graphqlExpress} from 'graphql-server-express';
//数据库dao
import {baseDao} from './dao/base_dao';
import {schema} from'./schema';
var app = express();

// import path from 'path';
// app.use('/download',express.static(path.join(__dirname, '../dist')));

//WsServer
var WsServer = require('http').createServer(app);
export const io = require('socket.io')(WsServer);

require('socketio-auth')(io, {
    authenticate: function (socket, data, callback) {
        //get credentials sent by the client
        let params = {};
        console.log(arguments[1]);
        if(data.accountName && data.token){
            params.accountName = data.accountName;
            return baseDao('user', 'getUserByAccountName', params)
                .then(obj=> {
                    if (obj[0] && (obj[0].token === data.token)) {
                        console.log("authenticate： " + (obj[0].token === data.token));
                        socket.join("room1");

                        io.to('room1').emit('serverToClientMessage', {
                            command: "getBettingInformation"
                        });

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
    origin: function (origin, callback) {
        // var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        var originIsWhitelisted = true;
        callback(originIsWhitelisted ? null : 'Bad Request', originIsWhitelisted);
    },
    credentials: true,
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

//test
import fetch from 'node-fetch';

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

app.get('/login', function (req, res, next) {
    fetch('http://localhost:3000/graphql', {
        method: 'POST',
        body: JSON.stringify(
            {
                "query": `query {
                              loginUser(accountName:"wangwang1",password:"123456") {
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


app.get('/submit', function (req, res, next) {
    fetch('http://localhost:3000/graphql', {
        method: 'POST',
        body: JSON.stringify(
            {
                "query": `mutation {
                              submitUser(
                                            accountName:"wangwang1",
                                            nickName:"阿强",
                                            password:"123456",
                                            phone:"18521566919",
                                            qqNumber:"manager",
                                            invitationCode:"rightInvitationCode"
                              ){
                                message
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


app.get('/test1', function (req, res, next) {
    let accountName = "wangwang1";
    let token = "dca4f4aff4b6d06cedde";
    let content = "大10000 大双10000 双10000  17草10000  18草10000  19草10000  极大10000  豹子10000  顺子10000  对子10000";
    let Test_Query = `query {
                              newMessage(accountName:"${accountName}",token:"${token}",content:"${content}") {
                                message
                              }
                            }`;
    fetch('http://localhost:3000/graphql', {
        method: 'POST',
        body: JSON.stringify(
            {
                "query": Test_Query
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

app.get('/testM', function (req, res, next) {
    let accountName = "wangwang1";
    let Test_Query = `query {
                              getCurrentAndPreviousBettingRecordByPeriodNumAndAccountName(accountName:"${accountName}") {
                                message
                              }
                            }`;
    fetch('http://localhost:3000/graphql', {
        method: 'POST',
        body: JSON.stringify(
            {
                "query": Test_Query
            }
        ),
        headers: {'Content-Type': 'application/json'}
    })
        .then(function (res) {
            return res.json();
        }).then(function (json) {
        console.log(JSON.parse(json.data.getCurrentAndPreviousBettingRecordByPeriodNumAndAccountName.message));
        res.send(json);
    });
});

app.get('/test', function (req, res) {
    //发送消息
    io.to('room1').emit('some event', '999');
    res.send('成功');
});

app.get('/test5', function (req, res) {
    let accountName = "ffm";
    let token = "d438bae7371bdcd8d4bd";
    let bettingContents = [{
        bettingName: "point",
        bettingNum: 300,
        pointNum: "0"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "1"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "2"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "3"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "4"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "5"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "6"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "7"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "8"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "9"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "10"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "11"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "12"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "13"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "14"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "15"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "16"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "17"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "18"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "19"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "20"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "21"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "22"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "23"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "24"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "25"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "26"
    }, {
        bettingName: "point",
        bettingNum: 300,
        pointNum: "27"
    }, {
        bettingName: "big",
        bettingNum: 2000

    }, {
        bettingName: "small",
        bettingNum: 1000

    }, {
        bettingName: "single",
        bettingNum: 2000

    }, {
        bettingName: "double",
        bettingNum: 2000

    }, {
        bettingName: "smallSingle",
        bettingNum: 20000

    }, {
        bettingName: "bigSingle",
        bettingNum: 20000

    }];

    let Test_Query = `mutation submitBetting($accountName: String!, $token: String!, $bettingContents: [BettingContent]) {
                              submitBettingRecord(accountName: $accountName,token: $token,bettingContents: $bettingContents) {
                                message
                              }
                            }`;
    fetch('http://localhost:3000/graphql', {
        method: 'POST',
        body: JSON.stringify(
            {
                "query": Test_Query,
                "variables":{
                    "accountName":accountName,
                    "token":token,
                    "bettingContents":bettingContents

                }
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

app.get('/test6', function (req, res) {
    let accountName = "ffm";
    let token = "d438bae7371bdcd8d4bd";
    // let bettingContents = [{
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "0"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "1"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "2"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "3"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "4"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "5"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "6"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "7"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "8"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "9"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "10"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "11"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "12"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "13"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "14"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "15"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "16"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "17"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "18"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "19"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "20"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "21"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "22"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "23"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "24"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "25"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "26"
    // }, {
    //     bettingName: "point",
    //     bettingNum: 300,
    //     pointNum: "27"
    // }, {
    //     bettingName: "big",
    //     bettingNum: 2000
    //
    // }, {
    //     bettingName: "small",
    //     bettingNum: 1000
    //
    // }, {
    //     bettingName: "single",
    //     bettingNum: 2000
    //
    // }, {
    //     bettingName: "double",
    //     bettingNum: 2000
    //
    // }, {
    //     bettingName: "smallSingle",
    //     bettingNum: 20000
    //
    // }, {
    //     bettingName: "bigSingle",
    //     bettingNum: 20000
    //
    // }];

    let bettingContents = [
        {
            pointNum:"0",
            bettingName:"point",
            bettingNum:300
        },
        {
            pointNum:"0",
            bettingName:"point",
            bettingNum:300
        }
        ,
        {
            pointNum:"0",
            bettingName:"point",
            bettingNum:300
        },
        {
            pointNum:"1",
            bettingName:"point",
            bettingNum:300
        },
        {
            bettingName:"small",
            bettingNum:1000
        }
    ];

    let Test_Query = `mutation submitCancelBettingRecorder($accountName: String!, $token: String!, $bettingContents: [BettingContent]) {
                              submitCancelBettingRecord(accountName: $accountName,token: $token,bettingContents: $bettingContents) {
                                message
                              }
                            }`;
    fetch('http://localhost:3000/graphql', {
        method: 'POST',
        body: JSON.stringify(
            {
                "query": Test_Query,
                "variables":{
                    "accountName":accountName,
                    "token":token,
                    "bettingContents":bettingContents

                }
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

app.use('/graphql', cors(corsOptions), bodyParser.json(), graphqlExpress({schema: schema}));

app.listen(3000, () => {
    console.log('Running a GraphQL API server at localhost:3000/graphql');
});
WsServer.listen(3001, () => {
    console.log('Running a WS server at localhost:3001');
});
