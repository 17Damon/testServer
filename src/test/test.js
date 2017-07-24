
import cheerio  from 'cheerio';
import fetch  from  'node-fetch';

fetch('http://www.bwlc.net/bulletin/keno.html')
    .then(function (response) {
        // console.dir(response.text());
        return response.text();
    }).then(function (body) {
    const $ = cheerio.load(body);
    console.log(body);
    // let periodNum = parseInt($('div .lott_cont table tr td').html(), 10);

    // console.log("periodNum");
    // console.log(periodNum);
});