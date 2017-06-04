/**
 * Created by zhubg on 2016/4/24.
 */

'use strict';

//allDao注册
var dao = {};
dao.user = require('./user_dao');
dao.bettingRecord = require('./bettingRecord_dao');
dao.systemInfo = require('./systemInfo_dao');
dao.gainBonusRecord = require('./gainBonusRecord_dao');
dao.tempSpace = require('./tempSpace_dao');
dao.lotteryRecord = require('./lotteryRecord_dao');

//baseDao
function baseDao( module, method, params) {

    //promise
    console.log('baseDao');

    //can not find dao
    if(!dao[module]) {
        console.log('baseDao can not find dao['+module+']');
        return Promise.reject(
            'baseDao can not find dao['+module+']'
        );
    }

    return dao[module]( module, method, params);
}

//return
export {baseDao};
