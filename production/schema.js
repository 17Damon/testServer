'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.schema = undefined;

var _graphqlTools = require('graphql-tools');

var _server = require('./server');

var _base_dao = require('./dao/base_dao');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

//数据库dao


var typeDefs = '\ntype User {\n    accountName: String!\n    password: String!\n    nickName: String!\n    phone: String!\n    qqNumber: String!\n    goldPoints: Int!\n    token: String!\n}\n\ntype LoginState {\n    token: String!\n    nickName: String!\n}\n\ntype Token {\n    token: String!\n}\n\ntype Message {\n    message: String!\n}\n\ntype Query {\n    getToken(id:ID!): Token!\n    newMessage(accountName:String!,token:String!,content:String!): Message!\n    loginUser(accountName:String!,password: String!):LoginState!\n}\n\ntype Mutation {\n  # \u6CE8\u518C\u7528\u6237, return \u6807\u5FD7\n  submitUser(\n             accountName: String!,\n             password: String!,\n             nickName: String!,\n             phone: String!,\n             qqNumber: String!,\n             invitationCode: String!\n  ): Message!\n}\n\nschema {\n  query: Query\n  mutation: Mutation\n}\n';

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
                        _server.io.to('room1').emit('some event', { nickName: obj[0].nickName, content: _arguments2[1].content });
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
        }
    },
    Mutation: {
        submitUser: function submitUser() {
            var _arguments3 = arguments;

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
                        params.user = _arguments3[1];
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
        }
    }
};

// Use graphql-tools to make a GraphQL.js schema
var schema = exports.schema = (0, _graphqlTools.makeExecutableSchema)({ typeDefs: typeDefs, resolvers: resolvers });