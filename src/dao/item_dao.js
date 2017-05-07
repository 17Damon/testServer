/**
 * Created by zhubg on 2016/4/24.
 */

'use strict';


//permission to kill
var tokill = {tokill: ['_rev', '_id', '_key']};

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
let dao = {};

//getItemById
dao.getItemById = function ( module, method, params) {
    //some code
    console.log(JSON.stringify(params));
    console.log('ItemDao-getItemById');
    if (params.id) {
        let id = params.id;
        console.log('id:' + id);
        var AQL = `
        For i in test
            FILTER i.id == \'` + id + `\' 
            return UNSET(i,@tokill)
        `;
        console.log('AQL:' + AQL);

        //promise
        return db.query(AQL, tokill)
            .then((cursor)=> {
                return cursor.all()
            });
    } else {
        throw `params.id Undefined!Check it!`;
    }
};

//getListBySection
dao.getListBySection = function ( module, method, params) {
    //some code
    console.log(JSON.stringify(params));
    console.log('ItemDao-getListBySection');
    if (params.section) {
        let section = params.section;
        console.log('section:' + section);
        var AQL = `
        For i in test
            FILTER i.section == \'` + section + `\' 
            SORT i.id DESC
            LIMIT 10
            return UNSET(i,@tokill)
        `;
        console.log('AQL:' + AQL);

        //promise
        return db.query(AQL, tokill)
            .then((cursor)=> {
                return cursor.all()
            });
    } else {
        throw `params.id Undefined!Check it!`;
    }
};

//insert
dao.insert = function ( module, method, params) {
    //some code

    console.log('Item-insert');
    if (params.item) {
        let item = JSON.stringify(params.item);
        var AQL = `
            INSERT ` + item + `
            IN test
            return NEW
        `;
        // console.log('AQL:' + AQL);

        //promise
        return db.query(AQL)
            .then((cursor)=> {
                return cursor.all()
            });
    } else {
        throw `params.user Undefined!Check it!`;
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
    let user = JSON.stringify({
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


    var AQL = `
            INSERT ` + user + `
            IN user
            return NEW
        `;
    console.log('AQL:' + AQL);

    //promise
    return db.query(AQL)
        .then((cursor)=> {
            return cursor.all()
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

    console.log('threadDao-queryAql')
    var aqlStr = '199';
    console.log('aqlStr:' + aqlStr);
    var AQL = `
        For i IN five 
        FILTER i.value == \'199\' 
        UPDATE i WITH { value: '250'} IN five 
        return UNSET(NEW,@tokill)
        `;
    console.log('AQL:' + AQL);
    //returns an array of result.
    return db.query(AQL, tokill)
        .then((cursor)=> {
            return cursor.all()
        });
};
//功能Dao---end---

//return
module.exports = itemDao;