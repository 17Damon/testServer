"use strict";

// import {baseDao} from '../dao/base_dao';
// //
// // let params = {};
// // params.periodNum = 820651;
// // params.accountName = 'ffm';
// // baseDao('bettingRecord', 'getCurrentAndPreviousBettingRecordByPeriodNumAndAccountName', params)
// //     .then(obj=> {
// //         console.log(obj[0].currentBettingRecord.length);
// //         console.log(obj[0].currentBettingRecord);
// //         console.log(obj[0].previousBettingRecord);
// //         // console.log(obj[0].previousBettingRecord[0].bettingContents);
// //         // console.log(obj[0].previousBettingRecord[0].bettingGain);
// //     }).catch(function (e) {
// //     console.log(e);
// // });
//
// import lodashFull from 'lodash';
//
// // console.log(lodashFull.isEqual({s1:"123",s2:"234"},{s1:"123",s2:"234"}));
//
// let params = {};
// params.accountName = "ffm";
// params.periodNum = 820650;
//
// let argsbettingContents = [
//     {
//         pointNum:"0",
//         bettingName:"point",
//         bettingNum:300
//     },
//     {
//         pointNum:"1",
//         bettingName:"point",
//         bettingNum:300
//     },
//     {
//         bettingName:"small",
//         bettingNum:1000
//     }
// ];
//
// baseDao('bettingRecord', 'getBettingRecordByPeriodNumAndAccountName', params).then(obj=> {
//     let updateBettingRecordList = [];
//     if (obj.length >0) {
//         for (let i = 0; i < obj.length; i++) {
//             let bettingContents = lodashFull.clone(obj[i].bettingContents);
//                 for (let k = 0; k < argsbettingContents.length; k++){
//                     if (argsbettingContents[k].bettingName==="point"){
//                         console.log(lodashFull.remove(bettingContents, function (n) {
//                             return (
//                                 n.bettingName === "point" &&
//                                 n.bettingNum === argsbettingContents[k].bettingNum &&
//                                 n.pointNum === argsbettingContents[k].pointNum
//                             );
//                         }));
//                     }else {
//                         console.log(lodashFull.remove(bettingContents, function (n) {
//                             return (
//                                 n.bettingName !== "point" &&
//                                 n.bettingName === argsbettingContents[k].bettingName &&
//                                 n.bettingNum === argsbettingContents[k].bettingNum
//                             );
//                         }));
//                     }
//                 }
//
//             updateBettingRecordList.push({
//                 bettingRecordId:obj[i]._id,
//                 bettingContents:bettingContents
//             })
//         }
//         console.log(updateBettingRecordList);
//         console.log(updateBettingRecordList[0].bettingContents.length);
//         console.log(updateBettingRecordList[1].bettingContents.length);
//     }else {
//         // return new Message("数据库无记录");
//         console.log("数据库无记录");
//     }
// }).catch(function (e) {
//     console.log(e);
//     // return new Message("数据库连接失败");
// });

var trees = [{ bettingName: "point", bettingNum: 300, pointNum: "2" }, "bay", "cedar", "oak", "maple"];
trees.splice(0, 1);

console.log(trees.length);
console.log(trees);
console.log(trees[0]);

// console.log(lodashFull.findIndex(trees,function (n) {
//     return (
//         n.bettingName === "point" &&
//         n.bettingNum === 300 &&
//         n.pointNum === "2"
//     );
// }));