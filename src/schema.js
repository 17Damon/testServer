/**
 * Created by zhubg on 2017/3/6.
 */
import {makeExecutableSchema} from 'graphql-tools';
import {io} from './server';
import moment from 'moment';
import lodashFull from 'lodash';

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

type BettingInformation  {
    currentPeriodNum: Int!
    previousPeriodNum: Int!
    gainBonusSum: Int!
    openingState: Boolean!
    goldPoints: Int!
    num1: Int!
    num2: Int!
    num3: Int!
    sum: Int!  
}

#输入类型关键字input
input BettingContent {
    pointNum: String
    bettingName: String!
    bettingNum: Int!
}

type Query {
    getToken(id:ID!): Token!
    newMessage(accountName:String!,token:String!,content:String!): Message!
    loginUser(accountName:String!,password: String!):LoginState!
    getBettingInformation(accountName:String!,token:String!): BettingInformation!
    serverToClientMessage(command:String!,superToken:String!): Message!
    getCurrentAndPreviousBettingRecordByPeriodNumAndAccountName(accountName:String!): Message!
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
  # 提交下注记录, return 标志
  submitBettingRecord(
             accountName: String!,
             token: String!,
             bettingContents: [BettingContent]
  ): Message!
  # 提交取消下注记录, return 标志
  submitCancelBettingRecord(
             accountName: String!,
             token: String!,
             bettingContents: [BettingContent]
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
    constructor(nickName, token) {
        this.nickName = nickName;
        this.token = token;
    }
}

class Message {
    constructor(message) {
        this.message = message;
    }

}

class BettingInformation {
    constructor(currentPeriodNum, previousPeriodNum, openingState, gainBonusSum, goldPoints, num1, num2, num3, sum) {
        this.currentPeriodNum = currentPeriodNum;
        this.previousPeriodNum = previousPeriodNum;
        this.openingState = openingState;
        this.gainBonusSum = gainBonusSum;
        this.goldPoints = goldPoints;
        this.num1 = num1;
        this.num2 = num2;
        this.num3 = num3;
        this.sum = sum;
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
                        params.token = token;
                        let nickName = obj[0].nickName;
                        //存储DB
                        return baseDao('user', 'updateTokenByAccountName', params)
                            .then(obj=> {
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
            if (arguments[1].accountName && arguments[1].token) {
                params.accountName = arguments[1].accountName;
                return baseDao('user', 'getUserByAccountName', params)
                    .then(obj=> {
                        if (obj[0] && (obj[0].token === arguments[1].token)) {
                            console.log("message_authenticate： " + (obj[0].token === arguments[1].token));
                            io.to('room1').emit('some event', {
                                nickName: obj[0].nickName,
                                content: arguments[1].content
                            });
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
        },
        serverToClientMessage(){
            if (arguments[1].superToken === "073b5306faa4874e7cd078f87752a761ae769ba0") {
                io.to('room1').emit('serverToClientMessage', {
                    command: arguments[1].command
                });
                return new Message("serverToClientMessageCommand发送成功");
            } else {
                return new Message("非法连接，超级口令错误");

            }
        },
        getCurrentAndPreviousBettingRecordByPeriodNumAndAccountName(){
            //参照  816322 期  2017-04-05 23:55:00
            //每天开奖179期
            let now = moment();
            let daysNum = (Math.floor((now - moment('2017-04-05 23:55:00')) / (24 * 60 * 60 * 1000)));
            let addDaysNum = Math.floor((((( (now - moment('2017-04-05 23:55:00')) / (24 * 60 * 60 * 1000) ) % 1) * 60 * 24) - 550) / 5);
            addDaysNum = addDaysNum >= 0 ? addDaysNum : 0;
            let currentPeriodNum = 179 * daysNum + 816324 + addDaysNum;
            let params = {};
            params.periodNum = currentPeriodNum;
            params.accountName = arguments[1].accountName;
            return baseDao('bettingRecord', 'getCurrentAndPreviousBettingRecordByPeriodNumAndAccountName', params)
                .then(obj=> {
                    console.log(obj);
                    return new Message(JSON.stringify(obj[0]));
                }).catch(function (e) {
                    console.log(e);
                    return new Message("数据库连接失败");
                });
        },
        getBettingInformation(){
            //参照  816322 期  2017-04-05 23:55:00
            //每天开奖179期
            let now = moment();
            let daysNum = (Math.floor((now - moment('2017-04-05 23:55:00')) / (24 * 60 * 60 * 1000)));
            let addDaysNum = Math.floor((((( (now - moment('2017-04-05 23:55:00')) / (24 * 60 * 60 * 1000) ) % 1) * 60 * 24) - 550) / 5);
            addDaysNum = addDaysNum >= 0 ? addDaysNum : 0;
            let currentPeriodNum = 179 * daysNum + 816324 + addDaysNum;
            let previousPeriodNum = currentPeriodNum - 1;

            //获取BettingInformation
            let gainBonusSum = 0;
            let openingState = false;
            let goldPoints = 0;
            let num1 = 0;
            let num2 = 0;
            let num3 = 0;
            let sum = 0;
            let params = {};
            console.log("getBettingInformation");
            if (arguments[1].accountName && arguments[1].token) {
                params.accountName = arguments[1].accountName;
                return baseDao('user', 'getUserByAccountName', params)
                    .then(obj=> {
                        if (obj[0] && (obj[0].token === arguments[1].token)) {
                            goldPoints = obj[0].goldPoints;
                            params = {};
                            params.periodNum = previousPeriodNum;
                            return baseDao('lotteryRecord', 'getLotteryRecordByPeriodNum', params).then(obj=> {
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
                                return baseDao('systemInfo', 'getSystemInfoBySystemInfoCode', params).then(obj=> {
                                    //开盘
                                    openingState = obj[0].infoValue;
                                    if (obj[0].infoValue) {
                                        params = {};
                                        params.periodNum = previousPeriodNum;
                                        params.accountName = arguments[1].accountName;
                                        return baseDao('bettingRecord', 'getBettingRecordByPeriodNumAndAccountName', params).then(obj=> {
                                            if (obj.length > 0) {
                                                let tempSum = 0;
                                                for (let i = 0; i < obj.length; i++) {
                                                    for (let j = 0; j < obj[i].bettingGain.length; j++) {
                                                        tempSum = tempSum + obj[i].bettingGain[j].bettingNum * obj[i].bettingGain[j].oddsNum;
                                                    }
                                                }
                                                //上期赚取
                                                gainBonusSum = tempSum;
                                            }
                                            return new BettingInformation(currentPeriodNum, previousPeriodNum, openingState, gainBonusSum, goldPoints, num1, num2, num3, sum);
                                        }).catch(function (e) {
                                            console.log(e);
                                        });
                                        //停盘
                                    } else {
                                        params = {};
                                        params.periodNum = currentPeriodNum;
                                        params.accountName = arguments[1].accountName;
                                        return baseDao('bettingRecord', 'getBettingRecordByPeriodNumAndAccountName', params).then(obj=> {
                                            if (obj[0]) {
                                                let tempSum = 0;
                                                for (let i = 0; i < obj.length; i++) {
                                                    for (let j = 0; j < obj[i].bettingContents.length; j++) {
                                                        tempSum = tempSum + obj[i].bettingContents[j].bettingNum;
                                                    }
                                                }
                                                //本期投注
                                                gainBonusSum = tempSum;
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
        submitUser() {
            let params = {};
            console.log("invitationCode");
            console.log(arguments[1].invitationCode);
            //邀请码
            if (arguments[1].invitationCode !== "rightInvitationCode1") {
                return new Message("邀请码错误");
            } else {
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
        },
        submitCancelBettingRecord(){

            //参照  816322 期  2017-04-05 23:55:00
            //每天开奖179期
            let now = moment();
            let daysNum = (Math.floor((now - moment('2017-04-05 23:55:00')) / (24 * 60 * 60 * 1000)));
            let addDaysNum = Math.floor((((( (now - moment('2017-04-05 23:55:00')) / (24 * 60 * 60 * 1000) ) % 1) * 60 * 24) - 550) / 5);
            addDaysNum = addDaysNum >= 0 ? addDaysNum : 0;
            let currentPeriodNum = 179 * daysNum + 816324 + addDaysNum;

            let params = {};
            console.log("submitCancelBettingRecord");
            console.log(arguments[1].accountName);
            console.log(arguments[1].token);
            console.log(arguments[1].bettingContents);
            let argsBettingContents = arguments[1].bettingContents;
            //取消下注总金额
            let bettingSumPionts = 0;
            // for (let i = 0; i < argsBettingContents.length; i++) {
            //     bettingSumPionts = bettingSumPionts + parseInt(argsBettingContents[i].bettingNum, 10);
            // }
            console.log("bettingSumPionts: " + bettingSumPionts);
            //查看开盘状态
            params.systemInfoCode = "openingState";
            return baseDao('systemInfo', 'getSystemInfoBySystemInfoCode', params)
                .then(obj=> {
                    if (obj[0].infoValue) {
                        //验证口令用户名
                        if (arguments[1].accountName && arguments[1].token) {
                            params = {};
                            params.accountName = arguments[1].accountName;
                            return baseDao('user', 'getUserByAccountName', params)
                                .then(obj=> {
                                        let goldPoints = obj[0].goldPoints;
                                        if (obj[0] && (obj[0].token === arguments[1].token)) {
                                            console.log("submitBetting_token_authenticate： " + (obj[0].token === arguments[1].token));
                                            //口令用户名验证成功,开始取消下注
                                            params = {};
                                            params.accountName = arguments[1].accountName;
                                            params.periodNum = currentPeriodNum;
                                            // params.periodNum = 821946;
                                            return baseDao('bettingRecord', 'getBettingRecordByPeriodNumAndAccountName', params).then(obj=> {
                                                let bettingContentsList = [];
                                                let updateFlag = false;
                                                if (obj.length > 0) {
                                                    for (let i = 0; i < obj.length; i++) {
                                                        let bettingContents = lodashFull.clone(obj[i].bettingContents);
                                                        let k = 0;
                                                        while (argsBettingContents.length > 0) {
                                                            if (argsBettingContents[k].bettingName === "point") {
                                                                if (lodashFull.remove(bettingContents, function (n) {
                                                                        return (
                                                                            n.bettingName === "point" &&
                                                                            n.bettingNum === argsBettingContents[k].bettingNum &&
                                                                            n.pointNum === argsBettingContents[k].pointNum
                                                                        );
                                                                    }).length > 0) {
                                                                    let index = lodashFull.findIndex(argsBettingContents, function (n) {
                                                                        return (
                                                                            n.bettingName === "point" &&
                                                                            n.bettingNum === argsBettingContents[k].bettingNum &&
                                                                            n.pointNum === argsBettingContents[k].pointNum
                                                                        );
                                                                    });
                                                                    bettingSumPionts = bettingSumPionts + parseInt(argsBettingContents[k].bettingNum, 10);


                                                                    argsBettingContents.splice(index, 1);

                                                                    updateFlag = true;

                                                                } else {
                                                                    k++;
                                                                }
                                                            } else {
                                                                if (lodashFull.remove(bettingContents, function (n) {
                                                                        return (
                                                                            n.bettingName !== "point" &&
                                                                            n.bettingName === argsBettingContents[k].bettingName &&
                                                                            n.bettingNum === argsBettingContents[k].bettingNum
                                                                        );
                                                                    }).length > 0) {
                                                                    let index = lodashFull.findIndex(argsBettingContents, function (n) {
                                                                        return (
                                                                            n.bettingName !== "point" &&
                                                                            n.bettingName === argsBettingContents[k].bettingName &&
                                                                            n.bettingNum === argsBettingContents[k].bettingNum
                                                                        );
                                                                    });
                                                                    bettingSumPionts = bettingSumPionts + parseInt(argsBettingContents[k].bettingNum, 10);


                                                                    argsBettingContents.splice(index, 1);

                                                                    updateFlag = true;

                                                                } else {
                                                                    k++;
                                                                }
                                                            }

                                                            if (argsBettingContents.length === k) {
                                                                break;
                                                            }
                                                        }

                                                        bettingContentsList.push({
                                                            ID: obj[i]._id,
                                                            bettingContents: bettingContents
                                                        })

                                                    }

                                                    if (!updateFlag) {
                                                        return new Message("无需更新");
                                                    }

                                                    console.log("bettingContentsList");
                                                    console.log(bettingContentsList);
                                                    params = {};
                                                    params.bettingContentsList = bettingContentsList;
                                                    return baseDao('bettingRecord', 'updateBettingContentsByID', params).then(obj=> {
                                                        console.log(obj);

                                                        //开始更新余额
                                                        console.log("将要增加金额： +" + bettingSumPionts);
                                                        params = {};
                                                        params.accountName = arguments[1].accountName;
                                                        params.additionGoldPoints = bettingSumPionts;
                                                        return baseDao('user', 'updateGoldPointsByAccountName', params)
                                                            .then(obj=> {
                                                                console.log(obj[0]);
                                                                if (obj[0] === undefined) {
                                                                    return new Message("没有该用户，取消投注更新金额失败");
                                                                } else if (obj[0].goldPoints === goldPoints + bettingSumPionts) {
                                                                    return new Message("取消成功");
                                                                } else {
                                                                    console.log("更新后与预计不符");
                                                                    console.log("obj[0].goldPoints");
                                                                    console.log(obj[0].goldPoints);
                                                                    console.log("goldPoints + bettingSumPionts");
                                                                    console.log(goldPoints + bettingSumPionts);

                                                                    return new Message("更新后与预计不符");
                                                                }
                                                            }).catch(function (e) {
                                                                console.log(e);
                                                                return new Message("数据库连接失败");
                                                            });
                                                    }).catch(function (e) {
                                                        console.log(e);
                                                        return new Message("数据库连接失败");
                                                    });
                                                } else {
                                                    console.log("数据库无下注记录");
                                                    return new Message("数据库无下注记录");
                                                }
                                            }).catch(function (e) {
                                                console.log(e);
                                                return new Message("数据库连接失败");
                                            });
                                        }
                                        else {
                                            console.log("非法连接，用户名口令不正确");
                                            return new Message("非法连接，用户名口令不正确");
                                        }
                                    }
                                ).catch(function (e) {
                                    console.log(e);
                                    return new Message("数据库连接失败");
                                });
                        } else {
                            console.log("非法连接，用户名口令为空");
                            return new Message("非法连接，用户名口令为空");
                        }
                    } else {
                        return new Message("现在是封盘时间，取消下注失败");
                    }
                }).catch(function (e) {
                    console.log(e);
                    return new Message("数据库连接失败");
                });

        },
        submitBettingRecord(){
            let params = {};
            console.log("submitBetting");
            console.log(arguments[1].accountName);
            console.log(arguments[1].token);
            console.log(arguments[1].bettingContents);
            //下注日期时间
            let bettingDate = moment();
            //下注总金额
            let bettingSumPionts = 0;
            for (let i = 0; i < arguments[1].bettingContents.length; i++) {
                bettingSumPionts = bettingSumPionts + parseInt(arguments[1].bettingContents[i].bettingNum, 10);
            }
            console.log("bettingSumPionts: " + bettingSumPionts);
            //查看开盘状态
            params.systemInfoCode = "openingState";
            return baseDao('systemInfo', 'getSystemInfoBySystemInfoCode', params)
                .then(obj=> {
                    if (obj[0].infoValue) {
                        //验证口令用户名
                        if (arguments[1].accountName && arguments[1].token) {
                            params = {};
                            params.accountName = arguments[1].accountName;
                            return baseDao('user', 'getUserByAccountName', params)
                                .then(obj=> {
                                        if (obj[0] && (obj[0].goldPoints < bettingSumPionts)) {
                                            return new Message("元宝不足，请充值");
                                        } else if (obj[0] && (obj[0].token === arguments[1].token)) {
                                            console.log("submitBetting_token_authenticate： " + (obj[0].token === arguments[1].token));
                                            //口令用户名验证成功,开始更新余额
                                            console.log("将要增加金额： -" + bettingSumPionts);
                                            params = {};
                                            params.accountName = arguments[1].accountName;
                                            params.additionGoldPoints = 0 - bettingSumPionts;
                                            return baseDao('user', 'updateGoldPointsByAccountName', params)
                                                .then(obj=> {
                                                    console.log(obj[0]);

                                                    //查询是否存在该用户下注记录
                                                    params = {};
                                                    //参照  816322 期  2017-04-05 23:55:00
                                                    //每天开奖179期
                                                    let daysNum = (Math.floor((bettingDate - moment('2017-04-05 23:55:00')) / (24 * 60 * 60 * 1000)));
                                                    let addDaysNum = Math.floor((((( (bettingDate - moment('2017-04-05 23:55:00')) / (24 * 60 * 60 * 1000) ) % 1) * 60 * 24) - 550) / 5);
                                                    addDaysNum = addDaysNum >= 0 ? addDaysNum : 0;
                                                    var periodNum = 179 * daysNum + 816324 + addDaysNum;
                                                    params.accountName = arguments[1].accountName;
                                                    params.periodNum = periodNum;
                                                    return baseDao('bettingRecord', 'getBettingRecordByPeriodNumAndAccountName', params)
                                                        .then(obj=> {
                                                            if(obj.length === 0){
                                                                //开始新增下注信息
                                                                params = {};
                                                                let bettingRecord = {};
                                                                bettingRecord.accountName = arguments[1].accountName;

                                                                //增加bettingContents属性ID
                                                                for (let i=0 ; i< arguments[1].bettingContents.length;i++){
                                                                    arguments[1].bettingContents[i].id = i+"";
                                                                }

                                                                bettingRecord.bettingContents = arguments[1].bettingContents;
                                                                bettingRecord.bettingDate = bettingDate.format('YYYY-MM-DD HH:mm:ss');
                                                                bettingRecord.bettingGain = [];
                                                                bettingRecord.periodNum = periodNum;
                                                                bettingRecord.settleFlag = false;
                                                                bettingRecord.settleDate = "";
                                                                params.bettingRecord = bettingRecord;
                                                                return baseDao('bettingRecord', 'insertBettingRecord', params)
                                                                    .then(obj=> {
                                                                        console.log(obj[0]);
                                                                        //下注成功
                                                                        return new Message("下注成功");
                                                                    }).catch(function (e) {
                                                                        console.log(e);
                                                                        return new Message("数据库连接失败");
                                                                    });
                                                            }else if(obj.length === 1){
                                                                //开始更新原有下注信息
                                                                let bettingContents = lodashFull.concat(arguments[1].bettingContents,obj[0].bettingContents);
                                                                console.log("bettingContents.length");
                                                                console.log(bettingContents.length);
                                                                for (let i=0 ; i< bettingContents.length;i++){
                                                                    bettingContents[i].id = i+"";
                                                                }

                                                                params = {};
                                                                let bettingContentsList = [];
                                                                bettingContentsList.push({
                                                                    ID: obj[0]._id,
                                                                    bettingContents: bettingContents
                                                                });
                                                                params.bettingContentsList=bettingContentsList;
                                                                return baseDao('bettingRecord', 'updateBettingContentsByID', params)
                                                                    .then(obj=> {
                                                                        console.log(obj[0]);
                                                                        //下注成功
                                                                        return new Message("下注成功");
                                                                    }).catch(function (e) {
                                                                        console.log(e);
                                                                        return new Message("数据库连接失败");
                                                                    });
                                                            }else{
                                                                return new Message("数据库存在多条记录，错误！");
                                                            }


                                                            }).catch(function (e) {
                                                        console.log(e);
                                                        return new Message("数据库连接失败");
                                                    });

                                                }).catch(function (e) {
                                                    console.log(e);
                                                    return new Message("数据库连接失败");
                                                });
                                        }
                                        else {
                                            console.log("非法连接，用户名口令不正确");
                                            return new Message("非法连接，用户名口令不正确");
                                        }
                                    }
                                ).catch(function (e) {
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
export const schema = makeExecutableSchema({typeDefs, resolvers});
