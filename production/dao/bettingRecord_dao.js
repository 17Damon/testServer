/**
 * Created by zhubg on 2017/3/18.
 */

'use strict';

//permission to kill

var tokill = ['_rev', '_id', '_key'];

//连接DB
var db = require('../util/database');

//userDao
function bettingRecordDao(module, method, params) {
    //code

    //promise
    console.log('bettingRecordDao');
    return dao[method](module, method, params);
}

//功能Dao--start--
var dao = {};

//getUserByAccountName
dao.getBettingRecordByEndTime = function (module, method, params) {
    //some code
    console.log('bettingRecord-getBettingRecordByEndTime');
    if (params.endTime) {
        var endTime = params.endTime;
        var AQL = '\n                    For i in bettingRecord\n                        FILTER \n                            (DATE_TIMESTAMP("' + endTime + '") - DATE_TIMESTAMP(i.bettingDate) <= 5*60*1000) &&\n                            (DATE_TIMESTAMP("' + endTime + '") -  DATE_TIMESTAMP(i.bettingDate)  >= 0)       &&\n                            (i.settleFlag == false) \n                            return i\n                  ';
        // console.log('AQL:' + AQL);
        //promise
        return db.query(AQL).then(function (cursor) {
            return cursor.all();
        });
    } else {
        throw 'params.endTime Undefined!Check it!';
    }
};

//getBettingRecordByPeriodNum
dao.getBettingRecordByPeriodNum = function (module, method, params) {
    //some code
    console.log('bettingRecord-getBettingRecordByPeriodNum');
    var bindVars = {};
    bindVars.tokill = tokill;
    bindVars.periodNum = params.periodNum;
    if (params.periodNum) {
        var periodNum = params.periodNum;
        var AQL = '\n                    For i in bettingRecord\n                        FILTER i.periodNum == @periodNum\n                    return UNSET(i,@tokill)\n                  ';
        // console.log('AQL:' + AQL);
        //promise
        return db.query(AQL, bindVars).then(function (cursor) {
            return cursor.all();
        });
    } else {
        throw 'params.periodNum Undefined!Check it!';
    }
};

//insertBettingRecord
dao.insertBettingRecord = function (module, method, params) {
    //some code
    var bindVars = {};
    bindVars.tokill = tokill;
    console.log('bettingRecordDao-insertBettingRecord');
    if (params.bettingRecord) {
        var bettingRecord = JSON.stringify(params.bettingRecord);
        var AQL = '\n            INSERT ' + bettingRecord + '\n            IN bettingRecord\n            return UNSET(NEW,@tokill)\n        ';
        // console.log('AQL:' + AQL);

        //promise
        return db.query(AQL, bindVars).then(function (cursor) {
            return cursor.all();
        });
    } else {
        throw 'params.bettingRecord Undefined!Check it!';
    }
};

//updateBettingGainAndSettleFlagByID
dao.updateBettingGainAndSettleFlagAndSettleDateByID = function (module, method, params) {
    //some code
    var bindVars = {};
    bindVars.tokill = tokill;
    console.log('bettingRecordDao-updateBettingGainAndSettleFlagAndSettleDateByID');
    if (params.bettingGainList && params.settleDate) {
        var bettingGainList = JSON.stringify(params.bettingGainList);
        var settleDate = params.settleDate;
        var AQL = '\n        For i in ' + bettingGainList + '\n        For j in bettingRecord\n            FILTER i.ID == j._id\n            UPDATE j WITH {bettingGain:i.bettingGain,settleFlag:true,settleDate:"' + settleDate + '"} IN bettingRecord\n            return UNSET(NEW,@tokill)\n        ';
        // console.log('AQL:' + AQL);

        //promise
        return db.query(AQL, bindVars).then(function (cursor) {
            return cursor.all();
        });
    } else {
        throw 'params.bettingGainList or params.settleDate Undefined!Check it!';
    }
};

//功能Dao---end---

//return
module.exports = bettingRecordDao;