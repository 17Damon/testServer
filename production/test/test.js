'use strict';

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _nodeFetch2.default)('http://www.bwlc.net/bulletin/keno.html').then(function (response) {
    // console.dir(response.text());
    return response.text();
}).then(function (body) {
    var $ = _cheerio2.default.load(body);
    console.log(body);
    // let periodNum = parseInt($('div .lott_cont table tr td').html(), 10);

    // console.log("periodNum");
    // console.log(periodNum);
});