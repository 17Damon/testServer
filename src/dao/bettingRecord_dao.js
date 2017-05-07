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

//getBettingRecordByEndTime
dao.getBettingRecordByEndTime = function (module, method, params) {
    //some code
    console.log('bettingRecord-getBettingRecordByEndTime');
    if (params.endTime) {
        var endTime = params.endTime;
        var AQL = `
                    For i in bettingRecord
                        FILTER 
                            (DATE_TIMESTAMP("${endTime}") - DATE_TIMESTAMP(i.bettingDate) <= 5*60*1000) &&
                            (DATE_TIMESTAMP("${endTime}") -  DATE_TIMESTAMP(i.bettingDate)  >= 0)       &&
                            (i.settleFlag == false) 
                            return i
                  `;
        // console.log('AQL:' + AQL);
        //promise
        return db.query(AQL)
            .then(function (cursor) {
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
    if (params.periodNum !== undefined) {
        let bindVars = {};
        bindVars.periodNum = params.periodNum;
        var AQL = `
                    For i in bettingRecord
                        FILTER 
                            (i.periodNum == @periodNum) &&
                            (i.settleFlag == false) 
                            return i
                  `;
        // console.log('AQL:' + AQL);
        //promise
        return db.query(AQL, bindVars)
            .then(function (cursor) {
                return cursor.all();
            });
    } else {
        throw 'params.periodNum Undefined!Check it!';
    }
};

//getCurrentAndPreviousBettingRecordByPeriodNumAndAccountName
dao.getCurrentAndPreviousBettingRecordByPeriodNumAndAccountName = function (module, method, params) {
    //some code
    console.log('bettingRecord-getCurrentAndPreviousBettingRecordByPeriodNumAndAccountName');
    let bindVars = {};
    bindVars.tokill = tokill;
    bindVars.periodNum = params.periodNum;
    bindVars.accountName = params.accountName;
    if (params.periodNum !== undefined && params.accountName !== undefined) {
        var AQL = `
                    LET currentBettingRecord = (For i in bettingRecord
                        FILTER i.periodNum == @periodNum && i.accountName == @accountName
                    return UNSET(i,@tokill))
                    LET previousBettingRecord = (For j in bettingRecord
                        FILTER j.periodNum == @periodNum-1 && j.accountName == @accountName
                    return UNSET(j,@tokill))
                    return {currentBettingRecord:currentBettingRecord,previousBettingRecord:previousBettingRecord}
                  `;
        // console.log('AQL:' + AQL);
        //promise
        return db.query(AQL, bindVars)
            .then(function (cursor) {
                return cursor.all();
            });
    } else {
        throw 'params.periodNum Undefined!Check it!';
    }
};


//getBettingRecordByPeriodNumAndAccountName
dao.getBettingRecordByPeriodNumAndAccountName = function (module, method, params) {
    //some code
    console.log('bettingRecord-getBettingRecordByPeriodNumAndAccountName');
    let bindVars = {};
    bindVars.tokill = ['_rev', '_key'];
    bindVars.periodNum = params.periodNum;
    bindVars.accountName = params.accountName;
    if (params.periodNum !== undefined && params.accountName !== undefined ) {
        var AQL = `
                    For i in bettingRecord
                        FILTER i.periodNum == @periodNum && i.accountName == @accountName
                    return UNSET(i,@tokill)
                  `;
        // console.log('AQL:' + AQL);
        //promise
        return db.query(AQL, bindVars)
            .then(function (cursor) {
                return cursor.all();
            });
    } else {
        throw 'params.periodNum Undefined!Check it!';
    }
};

//insertBettingRecord
dao.insertBettingRecord = function (module, method, params) {
    //some code
    let bindVars = {};
    bindVars.tokill = tokill;
    console.log('bettingRecordDao-insertBettingRecord');
    if (params.bettingRecord) {
        let bettingRecord = JSON.stringify(params.bettingRecord);
        var AQL = `
            INSERT ${bettingRecord}
            IN bettingRecord
            return UNSET(NEW,@tokill)
        `;
        // console.log('AQL:' + AQL);

        //promise
        return db.query(AQL, bindVars)
            .then((cursor)=> {
                return cursor.all();
            });
    } else {
        throw `params.bettingRecord Undefined!Check it!`;
    }
};

//updateBettingGainAndSettleFlagByID
dao.updateBettingGainAndSettleFlagAndSettleDateByID = function (module, method, params) {
    //some code
    let bindVars = {};
    bindVars.tokill = tokill;
    console.log('bettingRecordDao-updateBettingGainAndSettleFlagAndSettleDateByID');
    if (params.bettingGainList && params.settleDate) {
        let bettingGainList = JSON.stringify(params.bettingGainList);
        let settleDate = params.settleDate;
        var AQL = `
        For i in ${bettingGainList}
        For j in bettingRecord
            FILTER i.ID == j._id
            UPDATE j WITH {bettingGain:i.bettingGain,settleFlag:true,settleDate:"${settleDate}"} IN bettingRecord
            return UNSET(NEW,@tokill)
        `;
        // console.log('AQL:' + AQL);

        //promise
        return db.query(AQL, bindVars)
            .then((cursor)=> {
                return cursor.all();
            });
    } else {
        throw `params.bettingGainList or params.settleDate Undefined!Check it!`;
    }
};

//updateBettingContentsByID
dao.updateBettingContentsByID = function (module, method, params) {
    //some code
    let bindVars = {};
    bindVars.tokill = tokill;
    bindVars.bettingContentsList = params.bettingContentsList;
    console.log('bettingRecordDao-updateBettingContentsByID');
    if (params.bettingContentsList !== undefined) {
        var AQL = `
        For i in @bettingContentsList
        For j in bettingRecord
            FILTER i.ID == j._id
            UPDATE j WITH {bettingContents:i.bettingContents} IN bettingRecord
            return UNSET(NEW,@tokill)
        `;
        // console.log('AQL:' + AQL);

        //promise
        return db.query(AQL, bindVars)
            .then((cursor)=> {
                return cursor.all();
            });
    } else {
        throw `params.bettingContentsList Undefined!Check it!`;
    }
};

//功能Dao---end---

//return
module.exports = bettingRecordDao;