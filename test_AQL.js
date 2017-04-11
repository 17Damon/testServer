/**
 * Created by zhubg on 2017/3/24.
 */

//数据库dao
import {baseDao} from './production/dao/base_dao';
//连接DB
// const db = require('./production/util/database');
// //permission to kill
// var tokill = {tokill: ['_rev', '_id', '_key']};


// var action = String(function () {
//     // This code will be executed inside ArangoDB!
//     const aql = require('@arangodb').aql;
//     const db = require("@arangodb").db;
//     return db._query(aql`
//             For i in user
//                 FILTER i.accountName == "ffm"
//                 UPDATE i WITH {goldPoints:i.goldPoints+-200} IN user
//             return NEW
//         `).toArray();
// });
//
// db.transaction({write: "user"}, action)
//     .then(result => {
//         // result contains the return value of the action
//         console.log(Promise.resolve(result));
//         return Promise.resolve(result);
//     });

// db._query(" For i in user    FILTER i.accountName == \"ffm\"    UPDATE i WITH {goldPoints:i.goldPoints+-200} IN user   return UNSET(NEW, \"_key\", \"_id\", \"_rev\") ").toArray();
// db._query("For i in [ { accountName: 'ffm', gainBonusSum: 5000 } ] For j in user FILTER j.accountName == i.accountName UPDATE j WITH {goldPoints:j.goldPoints+i.gainBonusSum} IN user return UNSET(NEW, \"_key\", \"_id\", \"_rev\") ").toArray();
//
//
// let tempContent = JSON.stringify([1,2,3,4,5]);
//
// db.query(`For i in [ { accountName: 'ffm', gainBonusSum: 5000 } ]
//             For j in user
//                 FILTER i.accountName == j.accountName
//             return j
//         `).then((cursor)=> {
//     return cursor.all();
// }).then((obj)=>{
//     console.log(obj);
// });
//
// let gainBonusRecordList = [ { accountName: 'ffm', gainBonusSum: 4800 } ];
//
// if (gainBonusRecordList){
//     console.log("yes");
// }
// console.log(gainBonusRecordList);
// let gainBonusRecord =JSON.stringify(gainBonusRecordList);
// console.log(gainBonusRecord);
//
// let test = "For i in "+JSON.stringify(gainBonusRecordList)+" For j in user FILTER j.accountName == i.accountName UPDATE j WITH {goldPoints:j.goldPoints+i.gainBonusSum} IN user return NEW";
// console.log(test);
//
// db._query('For i in [{"accountName":"ffm","gainBonusSum":4800}] For j in user FILTER j.accountName == i.accountName UPDATE j WITH {goldPoints:j.goldPoints+i.gainBonusSum} IN user return UNSET(NEW, "_key", "_id", "_rev")').toArray();
//


// db.query(`INSERT [{"accountName":"ffm","gainBonusSum":7200}]
//                 IN gainBonusRecord
//           return NEW
//             `).then((cursor)=> {
//     return cursor.all();
// }).then((obj)=>{
//     console.log(obj);
// });

// let params2 = {};
// let GainBonusRecord = {};
// GainBonusRecord.gainBonusRecordList = 11111;
// GainBonusRecord.periodNum = 88888;
// params2.GainBonusRecord = GainBonusRecord;



