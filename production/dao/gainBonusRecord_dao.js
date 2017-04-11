/**
 * Created by zhubg on 2017/3/25.
 */

'use strict';

//permission to kill

var tokill = { tokill: ['_rev', '_id', '_key'] };

//连接DB
var db = require('../util/database');

//userDao
function gainBonusRecordDao(module, method, params) {
    //code

    //promise
    console.log('gainBonusRecordDao');
    return dao[method](module, method, params);
}

//功能Dao--start--
var dao = {};

//getUserByAccountName
dao.getBettingRecordByEndTime = function (module, method, params) {
    //some code
    console.log('userDao-getUserByAccountName');
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

//insertGainBonusRecord
dao.insertGainBonusRecord = function (module, method, params) {
    //some code
    console.log('gainBonusRecordDao-insertGainBonusRecord');
    if (params.gainBonusRecord) {
        var gainBonusRecord = JSON.stringify(params.gainBonusRecord);
        var AQL = '\n            INSERT ' + gainBonusRecord + '\n            IN gainBonusRecord\n            return UNSET(NEW,@tokill)\n        ';
        console.log('AQL:' + AQL);

        //promise
        return db.query(AQL, tokill).then(function (cursor) {
            return cursor.all();
        });
    } else {
        throw 'params.gainBonusRecord Undefined!Check it!';
    }
};

//功能Dao---end---

//return
module.exports = gainBonusRecordDao;