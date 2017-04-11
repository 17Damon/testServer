/**
 * Created by zhubg on 2017/3/18.
 */

'use strict';

//permission to kill

var tokill = { tokill: ['_rev', '_id', '_key'] };

//连接DB
var db = require('../util/database');

//lotteryRecordDao
function lotteryRecordDao(module, method, params) {
    //code

    //promise
    console.log('lotteryRecordDao');
    return dao[method](module, method, params);
}

//功能Dao--start--
var dao = {};

//getLotteryRecordByPeriodNum
dao.getLotteryRecordByPeriodNum = function (module, method, params) {
    //some code
    console.log('lotteryRecord-getLotteryRecordByPeriodNum');
    var bindVars = {};
    bindVars.tokill = ['_rev', '_id', '_key'];
    bindVars.periodNum = params.periodNum;
    if (params.periodNum) {
        var periodNum = params.periodNum;
        var AQL = '\n                    For i in lotteryRecord\n                        FILTER i.periodNum == @periodNum\n                    return UNSET(i,@tokill)\n                  ';
        // console.log('AQL:' + AQL);
        //promise
        return db.query(AQL, bindVars).then(function (cursor) {
            return cursor.all();
        });
    } else {
        throw 'params.periodNum Undefined!Check it!';
    }
};

//insertLotteryRecord
dao.insertLotteryRecord = function (module, method, params) {
    //some code
    console.log('lotteryRecordDao-insertLotteryRecord');
    if (params.lotteryRecord) {
        var lotteryRecord = JSON.stringify(params.lotteryRecord);
        var AQL = '\n            INSERT ' + lotteryRecord + '\n            IN lotteryRecord\n            return UNSET(NEW,@tokill)\n        ';
        // console.log('AQL:' + AQL);

        //promise
        return db.query(AQL, tokill).then(function (cursor) {
            return cursor.all();
        });
    } else {
        throw 'params.lotteryRecord Undefined!Check it!';
    }
};

//updateBettingGainAndSettleFlagByID
dao.updateBettingGainAndSettleFlagAndSettleDateByID = function (module, method, params) {
    //some code
    console.log('bettingRecordDao-updateBettingGainAndSettleFlagAndSettleDateByID');
    if (params.bettingGainList && params.settleDate) {
        var bettingGainList = JSON.stringify(params.bettingGainList);
        var settleDate = params.settleDate;
        var AQL = '\n        For i in ' + bettingGainList + '\n        For j in bettingRecord\n            FILTER i.ID == j._id\n            UPDATE j WITH {bettingGain:i.bettingGain,settleFlag:true,settleDate:"' + settleDate + '"} IN bettingRecord\n            return UNSET(NEW,@tokill)\n        ';
        // console.log('AQL:' + AQL);

        //promise
        return db.query(AQL, tokill).then(function (cursor) {
            return cursor.all();
        });
    } else {
        throw 'params.bettingGainList or params.settleDate Undefined!Check it!';
    }
};

//功能Dao---end---

//return
module.exports = lotteryRecordDao;