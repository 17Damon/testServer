/**
 * Created by zhubg on 2016/4/24.
 */

'use strict';

//permission to kill

var tokill = { tokill: ['_rev', '_id', '_key'] };

//连接DB
var db = require('../util/database');

//itemDao
function itemDao(module, method, params) {
    //code

    //promise
    console.log('itemDao');
    return dao[method](module, method, params);
}

//功能Dao--start--
var dao = {};

//getItemById
dao.getItemById = function (module, method, params) {
    //some code
    console.log(JSON.stringify(params));
    console.log('ItemDao-getItemById');
    if (params.id) {
        var id = params.id;
        console.log('id:' + id);
        var AQL = '\n        For i in test\n            FILTER i.id == \'' + id + '\' \n            return UNSET(i,@tokill)\n        ';
        console.log('AQL:' + AQL);

        //promise
        return db.query(AQL, tokill).then(function (cursor) {
            return cursor.all();
        });
    } else {
        throw 'params.id Undefined!Check it!';
    }
};

//getListBySection
dao.getListBySection = function (module, method, params) {
    //some code
    console.log(JSON.stringify(params));
    console.log('ItemDao-getListBySection');
    if (params.section) {
        var section = params.section;
        console.log('section:' + section);
        var AQL = '\n        For i in test\n            FILTER i.section == \'' + section + '\' \n            SORT i.id DESC\n            LIMIT 10\n            return UNSET(i,@tokill)\n        ';
        console.log('AQL:' + AQL);

        //promise
        return db.query(AQL, tokill).then(function (cursor) {
            return cursor.all();
        });
    } else {
        throw 'params.id Undefined!Check it!';
    }
};

//insert
dao.insert = function (module, method, params) {
    //some code

    console.log('Item-insert');
    if (params.item) {
        var item = JSON.stringify(params.item);
        var AQL = '\n            INSERT ' + item + '\n            IN test\n            return NEW\n        ';
        // console.log('AQL:' + AQL);

        //promise
        return db.query(AQL).then(function (cursor) {
            return cursor.all();
        });
    } else {
        throw 'params.user Undefined!Check it!';
    }
};

//edit
dao.edit = function (req, res, module, method, params) {
    //some code

    //promise
    return 'edit';
};

//move
dao.move = function (req, res, module, method, params) {
    console.log('threadDao-move');
    var user = JSON.stringify({
        openid: 'o7CarwEfoKMx_tWSo54kKFPtkgYA',
        nickname: '십칠오빠😏ૌ😏ૌ😏ૌ',
        sex: 1,
        language: 'zh_CN',
        city: '广州',
        province: '广东',
        country: '中国',
        headimgurl: 'http://wx.qlogo.cn/mmopen/tjyZNs9eviaibaM07clblnIKT5FfFKmXDIXGElIz4kUMRUqxVTFspQSRRN6ewybaElcteXI8hKwLSVHlibUcw4zeMTrwwXWVm0B/0',
        privilege: []
    });

    var AQL = '\n            INSERT ' + user + '\n            IN user\n            return NEW\n        ';
    console.log('AQL:' + AQL);

    //promise
    return db.query(AQL).then(function (cursor) {
        return cursor.all();
    });
};

//delete
dao.delete = function (req, res, module, method, params) {
    //some code

    //promise
    return 'delete';
};

//queryAql
dao.queryAql = function (req, res, module, method, params) {
    //some code

    console.log('threadDao-queryAql');
    var aqlStr = '199';
    console.log('aqlStr:' + aqlStr);
    var AQL = '\n        For i IN five \n        FILTER i.value == \'199\' \n        UPDATE i WITH { value: \'250\'} IN five \n        return UNSET(NEW,@tokill)\n        ';
    console.log('AQL:' + AQL);
    //returns an array of result.
    return db.query(AQL, tokill).then(function (cursor) {
        return cursor.all();
    });
};
//功能Dao---end---

//return
module.exports = itemDao;