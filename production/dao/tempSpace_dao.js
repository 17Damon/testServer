/**
 * Created by zhubg on 2017/3/25.
 */

'use strict';

//permission to kill

var tokill = { tokill: ['_rev', '_id', '_key'] };

//连接DB
var db = require('../util/database');

//userDao
function tempSpaceDao(module, method, params) {
    //code

    //promise
    console.log('tempSpaceDao');
    return dao[method](module, method, params);
}

//功能Dao--start--
var dao = {};

//getSystemInfoBySystemInfoCode
dao.getSystemInfoBySystemInfoCode = function (module, method, params) {
    //some code
    console.log('userDao-getSystemInfoBySystemInfoCode');
    if (params.systemInfoCode) {
        var systemInfoCode = params.systemInfoCode;
        var AQL = '\n                    For i in systemInfo\n                        FILTER i.systemInfoCode == "' + systemInfoCode + '"\n                            return UNSET(i,@tokill)\n                  ';
        console.log('AQL:' + AQL);
        //promise
        return db.query(AQL, tokill).then(function (cursor) {
            return cursor.all();
        });
    } else {
        throw 'params.systemInfoCode Undefined!Check it!';
    }
};

//updateTempContentByTempCode
dao.updateTempContentByTempCode = function (module, method, params) {
    //some code
    console.log('userDao-updateTempContentByTempCode');
    if (params.tempContent && params.tempCode) {
        var tempContent = JSON.stringify(params.tempContent);
        var tempCode = params.tempCode;
        var AQL = '\n        For i in tempSpace\n            FILTER i.tempCode == "' + tempCode + '"\n            UPDATE i WITH {tempContent:' + tempContent + '} IN tempSpace\n            return UNSET(NEW,@tokill)\n        ';
        // console.log('AQL:' + AQL);

        //promise
        return db.query(AQL, tokill).then(function (cursor) {
            return cursor.all();
        });
    } else {
        throw 'params.tempContent or params.tempCode Undefined!Check it!';
    }
};

//功能Dao---end---

//return
module.exports = tempSpaceDao;