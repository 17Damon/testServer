/**
 * Created by zhubg on 2017/3/21.
 */

'use strict';
import cron from 'node-cron';
import moment from 'moment';
import {baseDao} from '../dao/base_dao';
import cheerio  from 'cheerio';
import fetch  from  'node-fetch';

//开盘
cron.schedule('*/5 9-23 * * *', function () {
    let now = moment();
    if (now.hour() === 23 && now.minute() === 55) {
        console.log(now.format('YYYY-MM-DD HH:mm:ss') + " 今日已停盘");
    } else {
        //设置参数
        let params = {};
        params.systemInfoCode = "openingState";
        params.infoValue = true;
        return baseDao('systemInfo', 'updateInfoValueBySystemInfoCode', params)
            .then(obj=> {
                if (obj[0].infoValue) {
                    console.log(now.format('YYYY-MM-DD HH:mm:ss') + " 开盘");
                    let Test_Query = `query  serverToClientMessageQuery($command: String!, $superToken: String!) {
                              serverToClientMessage(command:$command,superToken:$superToken) {
                                message                     
                              }
                            }`;
                    fetch("http://127.0.0.1:3000/graphql", {
                        method: 'POST',
                        body: JSON.stringify(
                            {
                                "query": Test_Query,
                                "variables": {
                                    "command": "getBettingInformation",
                                    "superToken": "073b5306faa4874e7cd078f87752a761ae769ba0"
                                }
                            }
                        ),
                        headers: {'Content-Type': 'application/json'}
                    })
                        .then(function (res) {
                            return res.json();
                        }).then(function (json) {
                        console.log(json.data.serverToClientMessage.message);
                    });
                }
            }).catch(function (e) {
                console.log(e);
            });
    }
});

//取开奖结果，结算
cron.schedule('20 */5 9-23 * * *', function () {
    // cron.schedule('30 1,6,11,16,21,26,31,36,41,46,51,56 9-23 * * *', function () {
    let now = moment();
    if (now.hour() === 9 && now.minute() === 0) {
        console.log(now.format('YYYY-MM-DD HH:mm:ss') + " 今日已开盘,下个周期开始结算");
    } else {
        //取开奖结果
        let now = moment();
        let endTime = now.format('YYYY-MM-DD HH:mm:ss');
        console.log(endTime + " 取开奖结果");


        //取开奖网站期号
        fetch('http://www.bwlc.net/bulletin/keno.html')
            .then(function (response) {
                // console.dir(response.text());
                return response.text();
            }).then(function (body) {
            const $ = cheerio.load(body);
            // console.log(body);
            let periodNum = parseInt($('div .lott_cont table tr td').html(), 10);
//
            console.log("periodNum");
            console.log(periodNum);

            //参照  816322 期  2017-04-05 23:55:00
            //每天开奖179期
            var daysNum = (Math.floor((now - moment('2017-04-05 23:55:00')) / (24 * 60 * 60 * 1000)));
            var addDaysNum = Math.floor((((( (now - moment('2017-04-05 23:55:00')) / (24 * 60 * 60 * 1000) ) % 1) * 60 * 24) - 550) / 5);
            addDaysNum = addDaysNum >= 0 ? addDaysNum : 0;
            var currentPeriodNum = 179 * daysNum + 816324 + addDaysNum;
            let previousPeriodNum = currentPeriodNum - 1;
            //检测期号是否相同
            if (previousPeriodNum === periodNum) {
                //开始取当期开奖数字
                        let arr = $('div .lott_cont table tr td').next().html().split(",").sort(function(a, b) {
                            return a - b;
                        });

                        let tempSum = 0;
                        for (let i =0; i<6;i++){
                            tempSum += parseInt(arr[i], 10);
                        }
                        let num1=tempSum%10;

                        tempSum = 0;
                        for (let i =6; i<12;i++){
                            tempSum += parseInt(arr[i], 10);
                        }
                        let num2=tempSum%10;
                        tempSum = 0;

                        for (let i =12; i<18;i++){
                            tempSum += parseInt(arr[i], 10);
                        }
                        let num3=tempSum%10;

                        let sum =num1+num2+num3;

                        console.log(num1);
                        console.log(num2);
                        console.log(num3);
                        console.log(sum);

                        //分析中奖类型,建立开奖倍率结果列表
                        let winningList = [];
                        //大小单双 赔率为2
                        //小
                        if (sum >= 0 && sum <= 12) {
                            winningList.push({
                                bettingName: "small",
                                oddsNum: 2
                            });
                        }
                        //大
                        if (sum >= 15 && sum <= 27) {
                            winningList.push({
                                bettingName: "big",
                                oddsNum: 2
                            });
                        }
                        //单
                        if (sum % 2 !== 0) {
                            winningList.push({
                                bettingName: "single",
                                oddsNum: 2
                            });
                        }
                        //双
                        if (sum % 2 === 0) {
                            winningList.push({
                                bettingName: "double",
                                oddsNum: 2
                            });
                        }

                        //组合 赔率为4
                        //大单
                        if ((sum >= 15 && sum <= 27) && (sum % 2 !== 0)) {
                            winningList.push({
                                bettingName: "bigSingle",
                                oddsNum: 4
                            });
                        }
                        //小单 *13
                        if ((sum >= 0 && sum <= 13 ) && (sum % 2 !== 0)) {
                            winningList.push({
                                bettingName: "smallSingle",
                                oddsNum: 4
                            });
                        }
                        //大双 *14
                        if ((sum >= 14 && sum <= 27) && (sum % 2 === 0)) {
                            winningList.push({
                                bettingName: "bigDouble",
                                oddsNum: 4
                            });
                        }
                        //小双
                        if ((sum >= 0 && sum <= 12) && (sum % 2 === 0)) {
                            winningList.push({
                                bettingName: "smallDouble",
                                oddsNum: 4
                            });
                        }

                        //极值 赔率为15
                        //极大
                        if (sum >= 22 && sum <= 27) {
                            winningList.push({
                                bettingName: "maximum",
                                oddsNum: 15
                            });
                        }
                        //极小
                        if (sum >= 0 && sum <= 5) {
                            winningList.push({
                                bettingName: "minimal",
                                oddsNum: 15
                            });
                        }

                        //豹顺对
                        //豹子 赔率50
                        if (num1 === num2 && num2 === num3) {
                            winningList.push({
                                bettingName: "leopard",
                                oddsNum: 50
                            });
                        }

                        //顺子  赔率14
                        if (
                            ((num2 - num1 === 1) && (num3 - num2 === 1)) ||
                            ((num3 - num1 === 1) && (num2 - num3 === 1)) ||
                            ((num2 - num1 === 1) && (num1 - num3 === 1)) ||
                            ((num1 - num2 === 1) && (num3 - num1 === 1)) ||
                            ((num1 - num3 === 1) && (num3 - num2 === 1)) ||
                            ((num1 - num2 === 1) && (num2 - num3 === 1))
                        ) {
                            winningList.push({
                                bettingName: "sequence",
                                oddsNum: 14
                            });
                        }

                        //点数字
                        //0/27   赔率500
                        if (sum === 0) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '0',
                                oddsNum: 500
                            });
                        }

                        if (sum === 27) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '27',
                                oddsNum: 500
                            });
                        }

                        //1/26   赔率200
                        if (sum === 1) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '1',
                                oddsNum: 200
                            });
                        }

                        if (sum === 26) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '26',
                                oddsNum: 200
                            });
                        }

                        //2/25   赔率100
                        if (sum === 2) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '2',
                                oddsNum: 100
                            });
                        }

                        if (sum === 25) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '25',
                                oddsNum: 100
                            });
                        }

                        //3/24   赔率50
                        if (sum === 3) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '3',
                                oddsNum: 50
                            });
                        }

                        if (sum === 24) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '24',
                                oddsNum: 50
                            });
                        }

                        //4/23   赔率30
                        if (sum === 4) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '4',
                                oddsNum: 30
                            });
                        }

                        if (sum === 23) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '23',
                                oddsNum: 30
                            });
                        }

                        //5/22   赔率20
                        if (sum === 5) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '5',
                                oddsNum: 20
                            });
                        }

                        if (sum === 22) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '22',
                                oddsNum: 20
                            });
                        }

                        //6/21   赔率17
                        if (sum === 6) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '6',
                                oddsNum: 17
                            });
                        }

                        if (sum === 21) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '21',
                                oddsNum: 17
                            });
                        }

                        //7/20   赔率16
                        if (sum === 7) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '7',
                                oddsNum: 16
                            });
                        }

                        if (sum === 20) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '20',
                                oddsNum: 16
                            });
                        }

                        //8/19   赔率15
                        if (sum === 8) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '8',
                                oddsNum: 15
                            });
                        }

                        if (sum === 19) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '19',
                                oddsNum: 15
                            });
                        }

                        //9/18   赔率15
                        if (sum === 9) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '9',
                                oddsNum: 14
                            });
                        }

                        if (sum === 18) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '18',
                                oddsNum: 14
                            });
                        }

                        //10/11/16/17   赔率13
                        if (sum === 10) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '10',
                                oddsNum: 13
                            });
                        }

                        if (sum === 11) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '11',
                                oddsNum: 13
                            });
                        }

                        if (sum === 16) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '16',
                                oddsNum: 13
                            });
                        }

                        if (sum === 17) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '17',
                                oddsNum: 13
                            });
                        }

                        //12/13/14/15   赔率12
                        if (sum === 12) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '12',
                                oddsNum: 12
                            });
                        }

                        if (sum === 13) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '13',
                                oddsNum: 12
                            });
                        }

                        if (sum === 14) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '14',
                                oddsNum: 12
                            });
                        }

                        if (sum === 15) {
                            winningList.push({
                                bettingName: "point",
                                pointNum: '15',
                                oddsNum: 12
                            });
                        }

                        console.log("开奖倍率结果列表");
                        console.log(winningList);

                        //开奖结果打印
                        console.log(num1 + " + " + num2 + " + " + num3 + " = " + sum);

                        //开奖时间
                        let lotteryDate = now.format('YYYY-MM-DD HH:mm:ss');
                        console.log(lotteryDate);

                        //本期累计下注额
                        let currentPeriodNumBettingNum = 0;

                        //本期累计中奖额
                        let currentPeriodNumGainNum = 0;


                        //个人中奖结果列表
                        let bettingGain = [];
                        let bettingGainList = [];
                        //中奖人员名单
                        let winnerList = [];
                        let winnerBonusList = [];

                        let dupWinnerList = [];

                        let gainBonusRecordList = [];

                        let params = {};
                        params.periodNum = previousPeriodNum;
                        //结算
                        baseDao('bettingRecord', 'getBettingRecordByPeriodNum', params)
                            .then(obj=> {
                                console.log("bettingRecord_num");
                                console.log(obj.length);
                                //遍历所有人下注信息
                                for (let i = 0; i < obj.length; i++) {
                                    //遍历个人的下注详情
                                    for (let j = 0; j < obj[i].bettingContents.length; j++) {
                                        //检查是否中奖
                                        for (let k = 0; k < winningList.length; k++) {
                                            if (
                                                ((obj[i].bettingContents[j].bettingName === "point") && (obj[i].bettingContents[j].bettingName === winningList[k].bettingName) && (obj[i].bettingContents[j].pointNum === winningList[k].pointNum)) ||
                                                ((obj[i].bettingContents[j].bettingName !== "point") && (obj[i].bettingContents[j].bettingName === winningList[k].bettingName))
                                            ) {
                                                //生成中奖人员名单 ，生成个人中奖结果列表 bettingGain
                                                if (obj[i].bettingContents[j].bettingName === "point") {
                                                    bettingGain.push({
                                                        bettingName: obj[i].bettingContents[j].bettingName,
                                                        pointNum: obj[i].bettingContents[j].pointNum,
                                                        oddsNum: winningList[k].oddsNum,
                                                        bettingNum: obj[i].bettingContents[j].bettingNum
                                                    });

                                                    //生成中奖人员名单
                                                    winnerList.push(obj[i].accountName);
                                                    winnerBonusList.push({
                                                        accountName: obj[i].accountName,
                                                        gainBonus: winningList[k].oddsNum * obj[i].bettingContents[j].bettingNum
                                                    });
                                                } else {

                                                    if (
                                                        (sum === 13 || sum === 14) &&
                                                        (
                                                            obj[i].bettingContents[j].bettingName === "small" || obj[i].bettingContents[j].bettingName === "big" ||
                                                            obj[i].bettingContents[j].bettingName === "single" || obj[i].bettingContents[j].bettingName === "double" ||
                                                            obj[i].bettingContents[j].bettingName === "bigSingle" || obj[i].bettingContents[j].bettingName === "smallSingle" ||
                                                            obj[i].bettingContents[j].bettingName === "bigDouble" || obj[i].bettingContents[j].bettingName === "smallDouble"
                                                        ) && (obj[i].bettingContents[j].bettingNum > 10000)
                                                    ) {
                                                        bettingGain.push({
                                                            bettingName: obj[i].bettingContents[j].bettingName,
                                                            oddsNum: 1,
                                                            bettingNum: obj[i].bettingContents[j].bettingNum
                                                        });

                                                        //生成中奖人员名单
                                                        winnerList.push(obj[i].accountName);
                                                        winnerBonusList.push({
                                                            accountName: obj[i].accountName,
                                                            gainBonus: 1 * obj[i].bettingContents[j].bettingNum
                                                        });
                                                    } else if (
                                                        (sum === 13 || sum === 14) &&
                                                        (
                                                            obj[i].bettingContents[j].bettingName === "small" || obj[i].bettingContents[j].bettingName === "big" ||
                                                            obj[i].bettingContents[j].bettingName === "single" || obj[i].bettingContents[j].bettingName === "double"
                                                        ) && (obj[i].bettingContents[j].bettingNum > 1000 && obj[i].bettingContents[j].bettingNum <= 10000)
                                                    ) {
                                                        bettingGain.push({
                                                            bettingName: obj[i].bettingContents[j].bettingName,
                                                            oddsNum: 1.5,
                                                            bettingNum: obj[i].bettingContents[j].bettingNum
                                                        });

                                                        //生成中奖人员名单
                                                        winnerList.push(obj[i].accountName);
                                                        winnerBonusList.push({
                                                            accountName: obj[i].accountName,
                                                            gainBonus: 1.5 * obj[i].bettingContents[j].bettingNum
                                                        });
                                                    } else if (
                                                        (sum === 13 || sum === 14) &&
                                                        (
                                                            obj[i].bettingContents[j].bettingName === "bigSingle" || obj[i].bettingContents[j].bettingName === "smallSingle" ||
                                                            obj[i].bettingContents[j].bettingName === "bigDouble" || obj[i].bettingContents[j].bettingName === "smallDouble"
                                                        ) && (obj[i].bettingContents[j].bettingNum <= 10000)
                                                    ) {
                                                        bettingGain.push({
                                                            bettingName: obj[i].bettingContents[j].bettingName,
                                                            oddsNum: 3,
                                                            bettingNum: obj[i].bettingContents[j].bettingNum
                                                        });

                                                        //生成中奖人员名单
                                                        winnerList.push(obj[i].accountName);
                                                        winnerBonusList.push({
                                                            accountName: obj[i].accountName,
                                                            gainBonus: 3 * obj[i].bettingContents[j].bettingNum
                                                        });
                                                    } else {
                                                        bettingGain.push({
                                                            bettingName: obj[i].bettingContents[j].bettingName,
                                                            oddsNum: winningList[k].oddsNum,
                                                            bettingNum: obj[i].bettingContents[j].bettingNum
                                                        });

                                                        //生成中奖人员名单
                                                        winnerList.push(obj[i].accountName);
                                                        winnerBonusList.push({
                                                            accountName: obj[i].accountName,
                                                            gainBonus: winningList[k].oddsNum * obj[i].bettingContents[j].bettingNum
                                                        });
                                                    }


                                                }


                                                console.log("中奖了");
                                                console.log("个人下奖记录");
                                                console.log(obj[i].bettingContents[j]);
                                                console.log("开奖倍率结果列表");
                                                console.log(winningList[k]);
                                            } else {
                                                console.log("没中奖");
                                            }

                                        }

                                        //累计下注额
                                        currentPeriodNumBettingNum = currentPeriodNumBettingNum + obj[i].bettingContents[j].bettingNum;
                                    }

                                    console.log("个人中奖结果列表");
                                    console.log(bettingGain);
                                    bettingGainList.push({
                                        ID: obj[i]._id,
                                        bettingGain: bettingGain
                                    });
                                    //清空个人中奖结果列表
                                    bettingGain = [];


                                }

                                console.log("中奖人员名单");
                                console.log(winnerList);
                                dupWinnerList = Array.from(new Set(winnerList));
                                console.log("去除重复后中奖人员名单");
                                console.log(dupWinnerList);
                                console.log(winnerBonusList);
                                for (let i = 0; i < dupWinnerList.length; i++) {
                                    let tempSum = 0;
                                    for (let j = 0; j < winnerBonusList.length; j++) {
                                        if (dupWinnerList[i] === winnerBonusList[j].accountName) {
                                            tempSum = tempSum + winnerBonusList[j].gainBonus;
                                        }
                                    }
                                    gainBonusRecordList.push({
                                        accountName: dupWinnerList[i],
                                        gainBonusSum: tempSum
                                    });
                                    currentPeriodNumGainNum = currentPeriodNumGainNum + tempSum;
                                }
                                console.log("本期下注记录获奖预更新列表");
                                console.log(bettingGainList);
                                if (bettingGainList.length !== 0) {
                                    let params1 = {};
                                    params1.bettingGainList = bettingGainList;
                                    params1.settleDate = endTime;
                                    baseDao('bettingRecord', 'updateBettingGainAndSettleFlagAndSettleDateByID', params1)
                                        .then(obj=> {
                                            console.log(obj);
                                        }).catch(function (e) {
                                        console.log(e);
                                    });
                                }
                                console.log("本期预更新全部获奖人员及奖金列表");
                                console.log(gainBonusRecordList);
                                if (gainBonusRecordList.length !== 0) {
                                    let params2 = {};
                                    params2.gainBonusRecordList = gainBonusRecordList;
                                    baseDao('user', 'updateGoldPointsByGainBonusRecordList', params2)
                                        .then(obj=> {
                                            console.log("task-updateGoldPointsByGainBonusRecordList");
                                            params2 = {};
                                            let gainBonusRecord = {};
                                            gainBonusRecord.gainBonusRecordList = gainBonusRecordList;
                                            gainBonusRecord.periodNum = periodNum;
                                            gainBonusRecord.settleDate = endTime;
                                            params2.gainBonusRecord = gainBonusRecord;
                                            return baseDao('gainBonusRecord', 'insertGainBonusRecord', params2)
                                                .then(obj=> {
                                                    console.log("task-insertGainBonusRecord");
                                                }).catch(function (e) {
                                                    console.log(e);
                                                });
                                        }).catch(function (e) {
                                        console.log(e);
                                    });
                                }

                                //存储开奖结果
                                let params3 = {};
                                let lotteryRecord = {};
                                lotteryRecord.periodNum = periodNum;
                                lotteryRecord.num1 = num1;
                                lotteryRecord.num2 = num2;
                                lotteryRecord.num3 = num3;
                                lotteryRecord.sum = sum;
                                lotteryRecord.lotteryDate = lotteryDate;
                                lotteryRecord.winningList = winningList;
                                lotteryRecord.bettingNum = currentPeriodNumBettingNum;
                                lotteryRecord.gainNum = currentPeriodNumGainNum;
                                params3.lotteryRecord = lotteryRecord;

                                baseDao('lotteryRecord', 'insertLotteryRecord', params3)
                                    .then(obj=> {
                                        // console.log(winningList);
                                    }).catch(function (e) {
                                    console.log(e);
                                });


                                let Test_Query = `query  serverToClientMessageQuery($command: String!, $superToken: String!) {
                                                                                   serverToClientMessage(command:$command,superToken:$superToken) {
                                                                                     message                     
                                                                                   }
                                                                                 }`;
                                fetch("http://127.0.0.1:3000/graphql", {
                                    method: 'POST',
                                    body: JSON.stringify(
                                        {
                                            "query": Test_Query,
                                            "variables": {
                                                "command": "getBettingInformation",
                                                "superToken": "073b5306faa4874e7cd078f87752a761ae769ba0"
                                            }
                                        }
                                    ),
                                    headers: {'Content-Type': 'application/json'}
                                })
                                    .then(function (res) {
                                        return res.json();
                                    }).then(function (json) {
                                    console.log(json.data.serverToClientMessage.message);
                                });
                            }).catch(function (e) {
                            console.log(e);
                        });
            } else {
                console.log("第 " + previousPeriodNum + " 期开奖结果不存在");
            }
        }).catch(err=> {
            console.log(err)
        });
    }
});

// 停盘
cron.schedule('4,9,14,19,24,29,34,39,44,49,54,59 9-23 * * *', function () {
    //设置参数
    let params = {};
    params.systemInfoCode = "openingState";
    params.infoValue = false;
    return baseDao('systemInfo', 'updateInfoValueBySystemInfoCode', params)
        .then(obj=> {
            if (!obj[0].infoValue) {
                console.log(moment().format('YYYY-MM-DD HH:mm:ss') + " 停盘");
                let Test_Query = `query  serverToClientMessageQuery($command: String!, $superToken: String!) {
                              serverToClientMessage(command:$command,superToken:$superToken) {
                                message                     
                              }
                            }`;
                fetch("http://127.0.0.1:3000/graphql", {
                    method: 'POST',
                    body: JSON.stringify(
                        {
                            "query": Test_Query,
                            "variables": {
                                "command": "getBettingInformation",
                                "superToken": "073b5306faa4874e7cd078f87752a761ae769ba0"
                            }
                        }
                    ),
                    headers: {'Content-Type': 'application/json'}
                })
                    .then(function (res) {
                        return res.json();
                    }).then(function (json) {
                    console.log(json.data.serverToClientMessage.message);
                });
            }
        }).catch(function (e) {
            console.log(e);
        });
});