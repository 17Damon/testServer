/**
 * Created by zhubg on 2016/4/24.
 */

'use strict';


//permission to kill
var tokill = {tokill: ['_rev', '_id', '_key']};

//连接DB
var db = require('../util/database');

//userDao
function userDao( module, method, params) {
    //code

    //promise
    console.log('userDao');
    return dao[method](module, method, params);
}

//功能Dao--start--
let dao = {};

//getUserByAccountName
dao.getUserByAccountName = function (module, method, params) {
    //some code
    console.log('userDao-getUserByAccountName');
    if (params.accountName) {
        var accountName = params.accountName;
        var AQL = `
                    For i in user
                        FILTER i.accountName == "${accountName}"
                            return UNSET(i,@tokill)
                  `;
        //promise
        return db.query(AQL, tokill).then(function (cursor) {
            return cursor.all();
        });
    } else {
        throw 'params.accountName Undefined!Check it!';
    }
};

//insertUser
dao.insertUser = function (module, method, params) {
    //some code
    console.log('userDao-insertUser');
    if (params.user) {
        let user = JSON.stringify(params.user);
        var AQL = `
            INSERT ${user}
            IN user
            return NEW
        `;
        console.log('AQL:' + AQL);

        //promise
        return db.query(AQL)
            .then((cursor)=> {
                return cursor.all()
            });
    } else {
        throw `params.user Undefined!Check it!`;
    }
};

//updateTokenByAccountName
dao.updateTokenByAccountName = function ( module, method, params) {
    //some code
    console.log('userDao-updateTokenByAccountName');
    if (params.accountName && params.token) {
        let accountName = params.accountName;
        let token = params.token;
        var AQL = `
        For i in user
            FILTER i.accountName == "${accountName}"
            UPDATE i WITH {token:"${token}"} IN user
            return UNSET(NEW,@tokill)
        `;
        console.log('AQL:' + AQL);

        //promise
        return db.query(AQL, tokill)
            .then((cursor)=> {
                return cursor.all()
            });
    } else {
        throw `params.accountName or params.token Undefined!Check it!`;
    }
};

//updateGoldPointsByAccountName
dao.updateGoldPointsByAccountName = function ( module, method, params) {
    //some code
    console.log('userDao-updateGoldPointsByAccountName');
    if (params.accountName && params.additionGoldPoints) {
        let accountName = params.accountName;
        let additionGoldPoints = params.additionGoldPoints;
        // var AQL = `
        // For i in user
        //     FILTER i.accountName == "${accountName}"
        //     UPDATE i WITH {goldPoints:i.goldPoints+${additionGoldPoints}} IN user
        //     return NEW
        // `;
        // console.log('AQL:' + AQL);
        // console.log(typeof AQL);
        //启用事务
        var action = String(function () {
            // This code will be executed inside ArangoDB!
            const db = require("@arangodb").db;
            return db._query(' For i in user    FILTER i.accountName == "'+ params["accountName"] +'"    UPDATE i WITH {goldPoints:i.goldPoints+'+params["additionGoldPoints"]+'} IN user   return UNSET(NEW, "_key", "_id", "_rev") ').toArray();
        });

        return db.transaction({write: "user",allowImplicit: false}, action,{accountName:accountName,additionGoldPoints:additionGoldPoints})
            .then(result => {
                // result contains the return value of the action
                // console.log(Promise.resolve(result));
                return Promise.resolve(result);
            });
    } else {
        throw `params.accountName or params.newGoldPoints Undefined!Check it!`;
    }
};

//updateGoldPointsByGainBonusRecord
dao.updateGoldPointsByGainBonusRecordList = function ( module, method, params) {
    //some code
    console.log('userDao-updateGoldPointsByGainBonusRecordList');
    if (params.gainBonusRecordList) {
        let gainBonusRecordList =JSON.stringify(params.gainBonusRecordList);
        //启用事务
        var action = String(function () {
            // This code will be executed inside ArangoDB!
            const db = require("@arangodb").db;
            return db._query('For i in '+params["gainBonusRecordList"]+'    For j in user    FILTER j.accountName == i.accountName    UPDATE j WITH {goldPoints:j.goldPoints+i.gainBonusSum} IN user   return UNSET(NEW, "_key", "_id", "_rev") ').toArray();
        });

        return db.transaction({write: "user",allowImplicit: false}, action,{gainBonusRecordList:gainBonusRecordList})
            .then(result => {
                // result contains the return value of the action
                // console.log(Promise.resolve(result));
                return Promise.resolve(result);
            });
    } else {
        throw `params.gainBonusRecordList Undefined!Check it!`;
    }
};

//update
dao.update = function (req, res, module, method, params) {
    //some code
    console.log(JSON.stringify(params));
    console.log('userDao-update');
    if (params.user) {
        let openid = params.user.openid;
        console.log('openid:' + openid);
        var AQL = `
        For i in user
            FILTER i.openid == \'` + openid + `\' 
            UPDATE i WITH ` + JSON.stringify(params.user) + ` IN user
            return UNSET(i,@tokill)
        `;
        console.log('AQL:' + AQL);

        //promise
        return db.query(AQL, tokill)
            .then((cursor)=> {
                return cursor.all()
            });
    } else {
        throw `params.openid Undefined!Check it!`;
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
    console.log('userDao-move');

    //returns an array of result.
    return db.query(
        `
            For i in five
            limit 0,100
            return i
            `)
        .then((cursor)=> {
            return cursor.all()
        })

};

//deleteUserByOpenid
dao.deleteUserByOpenid = function (req, res, module, method, params) {
    //some code
    if (params.openid) {
        let openid = params.openid;
        var AQL = `
            FOR u IN user
            FILTER u.openid == '` + openid + `'
            REMOVE u IN user
            RETURN OLD
        `;
        console.log('AQL:' + AQL);

        //promise
        return db.query(AQL)
            .then((cursor)=> {
                return cursor.all()
            });
    } else {
        throw `params.user Undefined!Check it!`;
    }
};

//queryAql
dao.queryAql = function (req, res, module, method, params) {
    //some code

    console.log('userDao-queryAql');
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
module.exports = userDao;