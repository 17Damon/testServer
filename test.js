// /**
//  * Created by zhubg on 2017/4/6.
//  */
//
// const cheerio = require('cheerio');
// var fetch = require ('node-fetch');
//
// fetch('http://www.bwlc.net/bulletin/keno.html')
//     .then(function(response) {
//         // console.dir(response);
//         return response.text()
//     }).then(function(body) {
//     const $ = cheerio.load(body);
//     let periodNum = parseInt($('div .lott_cont table tr td').html(), 10);
//
//     console.log("periodNum");
//     console.log(periodNum);
//     let arr = $('div .lott_cont table tr td').next().html().split(",").sort(function(a, b) {
//         return a - b;
//     });
//
//     let tempSum = 0;
//     for (let i =0; i<6;i++){
//         tempSum += parseInt(arr[i], 10);
//     }
//     let num1=tempSum%10;
//     tempSum = 0;
//     for (let i =6; i<12;i++){
//         tempSum += parseInt(arr[i], 10);
//     }
//     let num2=tempSum%10;
//     tempSum = 0;
//     for (let i =12; i<18;i++){
//         tempSum += parseInt(arr[i], 10);
//     }+
//     let num3=tempSum%10;
//     let sum =num1+num2+num3;
//
//     console.log(num1);
//     console.log(num2);
//     console.log(num3);
//     console.log(sum);
//     // console.log($('div .lott_cont table tr td').next().next().html());
//     console.log($('div .lott_cont table tr td').next().next().next().html()+":00");
// }).catch(err => {
//     console.log(err);
// });
var moment = require("moment");
let now = moment("2017-04-11 18:00:40");
let daysNum = (Math.floor((now - moment('2017-04-05 23:55:00')) / (24 * 60 * 60 * 1000)));
let addDaysNum = Math.floor((((( (now - moment('2017-04-05 23:55:00')) / (24 * 60 * 60 * 1000) ) % 1) * 60 * 24) - 550) / 5);
addDaysNum = addDaysNum >= 0 ? addDaysNum : 0;
let currentPeriodNum = 179 * daysNum + 816324 + addDaysNum;
let previousPeriodNum = currentPeriodNum - 1;
// console.log(now.hour());
// console.log(now.minute());
console.log(currentPeriodNum);
// console.log(now.minute());
