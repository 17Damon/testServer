'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.schema = undefined;

var _graphqlTools = require('graphql-tools');

var _server = require('./server');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _base_dao = require('./dao/base_dao');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                           * Created by zhubg on 2017/3/6.
                                                                                                                                                           */


//数据库dao


var typeDefs = '\ntype User {\n    accountName: String!\n    password: String!\n    nickName: String!\n    phone: String!\n    qqNumber: String!\n    goldPoints: Int!\n    token: String!\n}\n\ntype LoginState {\n    token: String!\n    nickName: String!\n}\n\ntype Token {\n    token: String!\n}\n\ntype Message {\n    message: String!\n}\n\ntype BettingInformation  {\n    currentPeriodNum: Int!\n    previousPeriodNum: Int!\n    gainBonusSum: Int!\n    openingState: Boolean!\n    goldPoints: Int!\n    num1: Int!\n    num2: Int!\n    num3: Int!\n    sum: Int!  \n}\n\n#\u8F93\u5165\u7C7B\u578B\u5173\u952E\u5B57input\ninput BettingContent {\n    pointNum: String\n    bettingName: String!\n    bettingNum: Int!\n}\n\ntype Query {\n    getToken(id:ID!): Token!\n    newMessage(accountName:String!,token:String!,content:String!): Message!\n    loginUser(accountName:String!,password: String!):LoginState!\n    getBettingInformation(accountName:String!,token:String!): BettingInformation!\n    serverToClientMessage(command:String!,superToken:String!): Message!\n}\n\ntype Mutation {\n  # \u6CE8\u518C\u7528\u6237, return \u6807\u5FD7\n  submitUser(\n             accountName: String!,\n             password: String!,\n             nickName: String!,\n             phone: String!,\n             qqNumber: String!,\n             invitationCode: String!\n  ): Message!\n  # \u63D0\u4EA4\u4E0B\u6CE8\u8BB0\u5F55, return \u6807\u5FD7\n  submitBettingRecord(\n             accountName: String!,\n             token: String!,\n             bettingContents: [BettingContent]\n  ): Message!\n}\n\nschema {\n  query: Query\n  mutation: Mutation\n}\n';

var Token = function Token(token) {
    _classCallCheck(this, Token);

    this.token = token;
};

var LoginState = function LoginState(nickName, token) {
    _classCallCheck(this, LoginState);

    this.nickName = nickName;
    this.token = token;
};

var Message = function Message(message) {
    _classCallCheck(this, Message);

    this.message = message;
};

var BettingInformation = function BettingInformation(currentPeriodNum, previousPeriodNum, openingState, gainBonusSum, goldPoints, num1, num2, num3, sum) {
    _classCallCheck(this, BettingInformation);

    this.currentPeriodNum = currentPeriodNum;
    this.previousPeriodNum = previousPeriodNum;
    this.openingState = openingState;
    this.gainBonusSum = gainBonusSum;
    this.goldPoints = goldPoints;
    this.num1 = num1;
    this.num2 = num2;
    this.num3 = num3;
    this.sum = sum;
};

// Minimal resolvers


var resolvers = {
    Query: {
        //用户登录
        loginUser: function loginUser() {
            var _arguments = arguments;

            var params = {};
            console.log(arguments[1]);
            params.accountName = arguments[1].accountName;
            return (0, _base_dao.baseDao)('user', 'getUserByAccountName', params).then(function (obj) {
                if (obj[0] && obj[0].password === _arguments[1].password) {
                    var token = require('crypto').randomBytes(10).toString('hex');
                    params.token = token;
                    var nickName = obj[0].nickName;
                    //存储DB
                    return (0, _base_dao.baseDao)('user', 'updateTokenByAccountName', params).then(function (obj) {
                        console.log("nickName: " + nickName);
                        return new LoginState(nickName, token);
                    }).catch(function (e) {
                        console.log(e);
                    });
                } else {
                    return new LoginState("PermissionFailed", "PermissionFailed");
                }
            }).catch(function (e) {
                console.log(e);
            });
        },
        getToken: function getToken() {
            var token = require('crypto').randomBytes(10).toString('hex');
            console.log("token_test");
            console.log(token);
            return new Token(token);
        },
        newMessage: function newMessage() {
            var _arguments2 = arguments;

            //发送消息
            var params = {};
            console.log("newMessage");
            if (arguments[1].accountName && arguments[1].token) {
                params.accountName = arguments[1].accountName;
                return (0, _base_dao.baseDao)('user', 'getUserByAccountName', params).then(function (obj) {
                    if (obj[0] && obj[0].token === _arguments2[1].token) {
                        console.log("message_authenticate： " + (obj[0].token === _arguments2[1].token));
                        _server.io.to('room1').emit('some event', {
                            nickName: obj[0].nickName,
                            content: _arguments2[1].content
                        });
                        console.log("消息发送成功");
                        console.log(_arguments2[1]);
                        return new Message("消息发送成功");
                    } else {
                        console.log("非法连接，用户名口令不正确");
                        return new Message("非法连接，用户名口令不正确");
                    }
                }).catch(function (e) {
                    console.log(e);
                    return new Message("数据库连接失败");
                });
            } else {
                console.log("非法连接，用户名口令为空");
                return new Message("非法连接，用户名口令为空");
            }
        },
        serverToClientMessage: function serverToClientMessage() {
            if (arguments[1].superToken === "073b5306faa4874e7cd078f87752a761ae769ba0") {
                _server.io.to('room1').emit('serverToClientMessage', {
                    command: arguments[1].command
                });
                return new Message("serverToClientMessageCommand发送成功");
            } else {
                return new Message("非法连接，超级口令错误");
            }
        },
        getBettingInformation: function getBettingInformation() {
            var _arguments3 = arguments;

            //参照  816322 期  2017-04-05 23:55:00
            //每天开奖179期
            var now = (0, _moment2.default)();
            var daysNum = Math.floor((now - (0, _moment2.default)('2017-04-05 23:55:00')) / (24 * 60 * 60 * 1000));
            var addDaysNum = Math.floor(((now - (0, _moment2.default)('2017-04-05 23:55:00')) / (24 * 60 * 60 * 1000) % 1 * 60 * 24 - 550) / 5);
            addDaysNum = addDaysNum >= 0 ? addDaysNum : 0;
            var currentPeriodNum = 179 * daysNum + 816324 + addDaysNum;
            var previousPeriodNum = currentPeriodNum - 1;

            //获取BettingInformation
            var gainBonusSum = 0;
            var openingState = false;
            var goldPoints = 0;
            var num1 = 0;
            var num2 = 0;
            var num3 = 0;
            var sum = 0;
            var params = {};
            console.log("getBettingInformation");
            if (arguments[1].accountName && arguments[1].token) {
                params.accountName = arguments[1].accountName;
                return (0, _base_dao.baseDao)('user', 'getUserByAccountName', params).then(function (obj) {
                    if (obj[0] && obj[0].token === _arguments3[1].token) {
                        goldPoints = obj[0].goldPoints;
                        params = {};
                        params.periodNum = previousPeriodNum;
                        return (0, _base_dao.baseDao)('lotteryRecord', 'getLotteryRecordByPeriodNum', params).then(function (obj) {
                            if (obj.length > 0) {
                                num1 = obj[0].num1;
                                num2 = obj[0].num2;
                                num3 = obj[0].num3;
                                sum = obj[0].sum;
                            } else {
                                num1 = 6699;
                            }
                            params = {};
                            params.systemInfoCode = "openingState";
                            return (0, _base_dao.baseDao)('systemInfo', 'getSystemInfoBySystemInfoCode', params).then(function (obj) {
                                //开盘
                                openingState = obj[0].infoValue;
                                if (obj[0].infoValue) {
                                    params = {};
                                    params.periodNum = previousPeriodNum;
                                    return (0, _base_dao.baseDao)('bettingRecord', 'getBettingRecordByPeriodNum', params).then(function (obj) {
                                        if (obj[0]) {
                                            var tempSum = 0;
                                            for (var i = 0; i < obj.length; i++) {
                                                for (var j = 0; j < obj[i].bettingGain.length; j++) {
                                                    tempSum = tempSum + obj[i].bettingGain[j].bettingNum * obj[i].bettingGain[j].oddsNum;
                                                }
                                                //上期赚取
                                                gainBonusSum = tempSum;
                                            }
                                        }
                                        return new BettingInformation(currentPeriodNum, previousPeriodNum, openingState, gainBonusSum, goldPoints, num1, num2, num3, sum);
                                    }).catch(function (e) {
                                        console.log(e);
                                    });
                                    //停盘
                                } else {
                                    params = {};
                                    params.periodNum = currentPeriodNum;
                                    return (0, _base_dao.baseDao)('bettingRecord', 'getBettingRecordByPeriodNum', params).then(function (obj) {
                                        if (obj[0]) {
                                            var tempSum = 0;
                                            for (var i = 0; i < obj.length; i++) {
                                                for (var j = 0; j < obj[i].bettingContents.length; j++) {
                                                    tempSum = tempSum + obj[i].bettingContents[j].bettingNum;
                                                }
                                                //本期投注
                                                gainBonusSum = tempSum;
                                            }
                                        }
                                        return new BettingInformation(currentPeriodNum, previousPeriodNum, openingState, gainBonusSum, goldPoints, num1, num2, num3, sum);
                                    }).catch(function (e) {
                                        console.log(e);
                                    });
                                }
                            }).catch(function (e) {
                                console.log(e);
                            });
                        }).catch(function (e) {
                            console.log(e);
                        });
                    } else {
                        console.log("非法连接，用户名口令不正确");
                    }
                }).catch(function (e) {
                    console.log(e);
                });
            } else {
                console.log("非法连接，用户名口令为空");
            }
        }
    },
    Mutation: {
        submitUser: function submitUser() {
            var _arguments4 = arguments;

            var params = {};
            console.log("invitationCode");
            console.log(arguments[1].invitationCode);
            //邀请码
            if (arguments[1].invitationCode !== "rightInvitationCode1") {
                return new Message("邀请码错误");
            } else {
                params.accountName = arguments[1].accountName;
                console.log("submitUser");
                return (0, _base_dao.baseDao)('user', 'getUserByAccountName', params).then(function (obj) {
                    if (obj[0]) {
                        console.log("用户名已经存在");
                        return new Message("用户名已经存在");
                    } else {
                        console.log("params_check");
                        console.log(params);
                        params = {};
                        params.user = _arguments4[1];
                        params.user.token = "";
                        params.user.goldPoints = 0;
                        console.log(params);
                        return (0, _base_dao.baseDao)('user', 'insertUser', params).then(function (obj) {
                            if (obj[0]) {
                                console.log("注册成功");
                                return new Message("注册成功");
                            } else {
                                console.log("注册失败");
                                return new Message("注册失败");
                            }
                        }).catch(function (e) {
                            console.log(e);
                        });
                    }
                }).catch(function (e) {
                    console.log(e);
                });
            }
        },
        submitBettingRecord: function submitBettingRecord() {
            var _arguments5 = arguments;

            var params = {};
            console.log("submitBetting");
            console.log(arguments[1].accountName);
            console.log(arguments[1].token);
            console.log(arguments[1].bettingContents);
            //下注日期时间
            var bettingDate = (0, _moment2.default)();
            //下注总金额
            var bettingSumPionts = 0;
            for (var i = 0; i < arguments[1].bettingContents.length; i++) {
                bettingSumPionts = bettingSumPionts + parseInt(arguments[1].bettingContents[i].bettingNum, 10);
            }
            console.log("bettingSumPionts: " + bettingSumPionts);
            //查看开盘状态
            params.systemInfoCode = "openingState";
            return (0, _base_dao.baseDao)('systemInfo', 'getSystemInfoBySystemInfoCode', params).then(function (obj) {
                if (obj[0].infoValue) {
                    //验证口令用户名
                    if (_arguments5[1].accountName && _arguments5[1].token) {
                        params = {};
                        params.accountName = _arguments5[1].accountName;
                        return (0, _base_dao.baseDao)('user', 'getUserByAccountName', params).then(function (obj) {
                            if (obj[0] && obj[0].goldPoints < bettingSumPionts) {
                                return new Message("元宝不足，请充值");
                            } else if (obj[0] && obj[0].token === _arguments5[1].token) {
                                console.log("submitBetting_token_authenticate： " + (obj[0].token === _arguments5[1].token));
                                //口令用户名验证成功,开始更新余额
                                console.log("将要增加金额： -" + bettingSumPionts);
                                params = {};
                                params.accountName = _arguments5[1].accountName;
                                params.additionGoldPoints = 0 - bettingSumPionts;
                                return (0, _base_dao.baseDao)('user', 'updateGoldPointsByAccountName', params).then(function (obj) {
                                    console.log(obj[0]);
                                    //开始记录下注信息
                                    params = {};
                                    var bettingRecord = {};
                                    bettingRecord.accountName = _arguments5[1].accountName;
                                    bettingRecord.bettingContents = _arguments5[1].bettingContents;
                                    bettingRecord.bettingDate = bettingDate.format('YYYY-MM-DD HH:mm:ss');
                                    bettingRecord.bettingGain = [];

                                    //参照  816322 期  2017-04-05 23:55:00
                                    //每天开奖179期
                                    var daysNum = Math.floor((bettingDate - (0, _moment2.default)('2017-04-05 23:55:00')) / (24 * 60 * 60 * 1000));
                                    var addDaysNum = Math.floor(((bettingDate - (0, _moment2.default)('2017-04-05 23:55:00')) / (24 * 60 * 60 * 1000) % 1 * 60 * 24 - 550) / 5);
                                    addDaysNum = addDaysNum >= 0 ? addDaysNum : 0;
                                    var periodNum = 179 * daysNum + 816324 + addDaysNum;
                                    bettingRecord.periodNum = periodNum;
                                    bettingRecord.settleFlag = false;
                                    bettingRecord.settleDate = "";
                                    params.bettingRecord = bettingRecord;
                                    return (0, _base_dao.baseDao)('bettingRecord', 'insertBettingRecord', params).then(function (obj) {
                                        console.log(obj[0]);
                                        //下注成功
                                        return new Message("下注成功");
                                    }).catch(function (e) {
                                        console.log(e);
                                        return new Message("数据库连接失败");
                                    });
                                    // return new Message("下注成功");
                                }).catch(function (e) {
                                    console.log(e);
                                    return new Message("数据库连接失败");
                                });
                            } else {
                                console.log("非法连接，用户名口令不正确");
                                return new Message("非法连接，用户名口令不正确");
                            }
                        }).catch(function (e) {
                            console.log(e);
                            return new Message("数据库连接失败");
                        });
                    } else {
                        console.log("非法连接，用户名口令为空");
                        return new Message("非法连接，用户名口令为空");
                    }
                } else {
                    return new Message("现在是封盘时间，停止下注");
                }
            }).catch(function (e) {
                console.log(e);
                return new Message("数据库连接失败");
            });
        }
    }
};

// Use graphql-tools to make a GraphQL.js schema
var schema = exports.schema = (0, _graphqlTools.makeExecutableSchema)({ typeDefs: typeDefs, resolvers: resolvers });