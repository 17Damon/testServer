/**
 * Created by zhubg on 2017/3/18.
 */

'use strict';

//permission to kill

var tokill = { tokill: ['_rev', '_id', '_key'] };

//连接DB
var db = require('../util/database');

//userDao
function systemInfoDao(module, method, params) {
    //code

    //promise
    console.log('systemInfoDao');
    return dao[method](module, method, params);
}

//功能Dao--start--
var dao = {};

//getSystemInfoBySystemInfoCode
dao.getSystemInfoBySystemInfoCode = function (module, method, params) {
    //some code
    console.log('systemInfoDao-getSystemInfoBySystemInfoCode');
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

//updateInfoValueBySystemInfoCode
dao.updateInfoValueBySystemInfoCode = function (module, method, params) {
    //some code
    console.log('systemInfoDao-updateInfoValueBySystemInfoCode');
    if (params.systemInfoCode && (params.infoValue === true || params.infoValue === false)) {
        var systemInfoCode = params.systemInfoCode;
        var infoValue = params.infoValue;
        var AQL = '\n        For i in systemInfo\n            FILTER i.systemInfoCode == "' + systemInfoCode + '"\n            UPDATE i WITH {infoValue:' + infoValue + '} IN systemInfo\n            return UNSET(NEW,@tokill)\n        ';
        // console.log('AQL:' + AQL);

        //promise
        return db.query(AQL, tokill).then(function (cursor) {
            return cursor.all();
        });
    } else {
        throw 'params.systemInfoCode or params.infoValue Undefined!Check it!';
    }
};

//功能Dao---end---

//return
module.exports = systemInfoDao;