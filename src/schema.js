import {makeExecutableSchema} from 'graphql-tools';
import {io} from './server';

//数据库dao
import {baseDao} from './dao/base_dao';

const typeDefs = `
type User {
    accountName: String!
    password: String!
    nickName: String!
    phone: String!
    qqNumber: String!
    goldPoints: Int!
    token: String!
}

type LoginState {
    token: String!
    nickName: String!
}

type Token {
    token: String!
}

type Message {
    message: String!
}

type Query {
    getToken(id:ID!): Token!
    newMessage(accountName:String!,token:String!,content:String!): Message!
    loginUser(accountName:String!,password: String!):LoginState!
}

type Mutation {
  # 注册用户, return 标志
  submitUser(
             accountName: String!,
             password: String!,
             nickName: String!,
             phone: String!,
             qqNumber: String!,
             invitationCode: String!
  ): Message!
}

schema {
  query: Query
  mutation: Mutation
}
`;

class Token {
    constructor(token) {
        this.token = token;
    }
}

class LoginState {
    constructor(nickName,token) {
        this.nickName = nickName;
        this.token = token;
    }
}

class Message {
    constructor(message) {
        this.message = message;
    }

}

// Minimal resolvers
const resolvers = {
    Query: {
        //用户登录
        loginUser() {
            let params = {};
            console.log(arguments[1]);
            params.accountName = arguments[1].accountName;
            return baseDao('user', 'getUserByAccountName', params)
                .then(obj=> {
                    if (obj[0] && (obj[0].password === arguments[1].password)) {
                        let token = require('crypto').randomBytes(10).toString('hex');
                        params.token=token;
                        let nickName = obj[0].nickName;
                        //存储DB
                        return baseDao('user', 'updateTokenByAccountName', params)
                            .then(obj=> {
                                console.log("nickName: "+nickName);
                                return new LoginState(nickName,token);
                            }).catch(function (e) {
                                console.log(e);
                            });
                    } else {
                        return new LoginState("PermissionFailed","PermissionFailed");
                    }
                }).catch(function (e) {
                    console.log(e);
                });
        },
        getToken() {
            let token = require('crypto').randomBytes(10).toString('hex');
            console.log("token_test");
            console.log(token);
            return new Token(token);
        },
        newMessage(){
            //发送消息
            let params = {};
            console.log("newMessage");
            if(arguments[1].accountName && arguments[1].token){
                params.accountName = arguments[1].accountName;
                return baseDao('user', 'getUserByAccountName', params)
                    .then(obj=> {
                        if (obj[0] && (obj[0].token === arguments[1].token)) {
                            console.log("message_authenticate： " + (obj[0].token === arguments[1].token));
                            io.to('room1').emit('some event', {nickName:obj[0].nickName,content:arguments[1].content});
                            console.log("消息发送成功");
                            console.log(arguments[1]);
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
        submitUser() {
            let params = {};
            console.log("invitationCode");
            console.log(arguments[1].invitationCode);
            //邀请码
            if(arguments[1].invitationCode!=="rightInvitationCode1"){
                return new Message("邀请码错误");
            }else{
                params.accountName = arguments[1].accountName;
                console.log("submitUser");
                return baseDao('user', 'getUserByAccountName', params)
                    .then(obj=> {
                        if (obj[0]) {
                            console.log("用户名已经存在");
                            return new Message("用户名已经存在");
                        } else {
                            console.log("params_check");
                            console.log(params);
                            params = {};
                            params.user = arguments[1];
                            params.user.token = "";
                            params.user.goldPoints = 0;
                            console.log(params);
                            return baseDao('user', 'insertUser', params)
                                .then(obj=> {
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
export const schema = makeExecutableSchema({typeDefs, resolvers});
