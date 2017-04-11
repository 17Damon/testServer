/**
 * Created by zhubg on 2016/4/24.
 */

'use strict';

// database connect 应用启动时已经初始化完成

var host = '120.27.124.108';
// const host = '127.0.0.1';
var port = '8529';
var database = 'phonegame';
var username = 'tester';
var password = 'cqmygysdss1987';

var db = require('arangojs')({
    url: 'http://' + username + ':' + password + '@' + host + ':' + port,
    databaseName: database
});

console.log('database');
// db.useDatabase('myapp');

//return
module.exports = db;