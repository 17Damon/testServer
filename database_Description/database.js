/**
 * Created by zhubg on 2017/2/15.
 */

//user
db._create("user");

// 账号       accountName: 'wangwang'
// 昵称       nickName：'阿强'
// 密码       password: '123456',
// 手机号码    phone:'18521566919',
// QQ号码     qqNumber: 'manager',
// 积分       goldPoints: 1000,
// 口令       token: 'publishtoken'

db._query(`
            INSERT {
                       accountName:'wangwang',
                       nickName:'阿强',
                       password:'123456',
                       phone:'18521566919',
                       qqNumber:'manager',
                       goldPoints: 1000,
                       token: 'publishtoken'
                       }
            IN user
            return NEW
        `).toArray();


//bettingRecord
db._create("bettingRecord");

db._query(`
            INSERT {
                       accountName:'wangwang',
                       bettingContent:[]
                       bettingDate:'123456',
                       bettingGain:[],
                       }
            IN bettingRecord
            return NEW
        `).toArray();

db._query(`
            For i in bettingRecord
                        FILTER DATE_TIMESTAMP(i.bettingDate) - DATE_TIMESTAMP("2017-03-23 15:39:35") <= 1*60*1000
                            return i
        `).toArray();

db._query(`
            For i in bettingRecord
                FILTER (DATE_TIMESTAMP(i.bettingDate) - DATE_TIMESTAMP("2017-03-23 18:48:00") <= 5*60*1000) && (DATE_TIMESTAMP(i.bettingDate) - DATE_TIMESTAMP("2017-03-23 18:48:00") >= 0)
                    return i
        `).toArray();

db._query(`
            return DATE_TIMESTAMP("2017-03-23 15:40:36") - DATE_TIMESTAMP("2017-03-23 18:48:00")
        `).toArray();

db._query(`
LET userList = (For i in user
                    LIMIT 7,5
                return i
                )
            return {count:LENGTH(user),userList:userList}
        `).toArray();

db._executeTransaction({
    collections: {
        write: "user"
    },
    action: function () {
        var db = require('@arangodb').db;
        return db._query(`
            For i in user
                FILTER i.accountName == "ffm"
                UPDATE i WITH {goldPoints:i.goldPoints+200} IN user
            return NEW
        `);
    }
}).then((cursor)=> {
    // console.log(cursor);
    return cursor.all()
});

//systemInfo
db._create("systemInfo");

db._query(`
            INSERT {
                       systemInfoCode:'openingState',
                       infoValue: true
                       }
            IN systemInfo
            return NEW
        `).toArray();

//弃用
//tempSpace
db._create("tempSpace");

db._query(`
            INSERT {
                       tempCode:'tempBettingGainList',
                       tempContent: []
                       }
            IN tempSpace
            return NEW
        `).toArray();


//gainBonusRecord
db._create("gainBonusRecord");


db._query(`
            INSERT {
                       tempCode:'tempWinnerGainList',
                       tempContent: []
                       }
            IN tempSpace
            return NEW
        `).toArray();


//lotteryRecord
db._create("lotteryRecord");


db._query(`
            INSERT {
                       periodNum:815101,
                       num1:4,
                       num2:5,
                       num3:6,
                       sum:15,
                       winningList:[]
                       }
            IN lotteryRecord
            return NEW
        `).toArray();

//pointAddAndSubtractRecord
db._create("pointAddAndSubtractRecord");


db._query(`
            INSERT {
                       user_fid: 'user/16505987',
                       additionPoints: 1000,
                       approvalFlag: false,
                       approvalDate: '2017-05-13 15:40:30',
                       submitDate: '2017-05-13 15:40:30',
                       approvalUser_fid: 'user/16258824'
                       }
            IN pointAddAndSubtractRecord
            return NEW
        `).toArray();