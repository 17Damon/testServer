'use strict';

var moment = require('moment');
var now = moment();
var daysNum = Math.floor((now - moment('2017-04-05 23:55:00')) / (24 * 60 * 60 * 1000));
var addDaysNum = Math.floor(((now - moment('2017-04-05 23:55:00')) / (24 * 60 * 60 * 1000) % 1 * 60 * 24 - 550) / 5);
addDaysNum = addDaysNum >= 0 ? addDaysNum : 0;
var currentPeriodNum = 179 * daysNum + 816323 + addDaysNum;
console.log(currentPeriodNum);