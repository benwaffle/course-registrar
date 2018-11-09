const querystring = require('querystring');
const url = require('url');
const https = require('https');
const cookie = require('cookie');
const cheerio = require('cheerio');

const SID = '';
const PIN = ''; // login to Student Self Services, then open view-source:https://mystevens.stevens.edu/sso/web4student.php

let classes = Array(10).fill('');
classes[0] = 10001;
classes[1] = 10002;

const u = url.parse('https://es.stevens.edu/ia-bin/tsrvweb.exe');
const str = classes.map((code) => `&Action=R&Callnum=${code}`).join('');
const form = querystring.stringify({
    SID,
    PIN,
    Term: '2019S',
    tserve_trans_config: 'rstureg.cfg',
}) + str;

const enroll = https.request(
    {
        host: u.host,
        path: u.path,
        ciphers: 'DES-CBC3-SHA',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(form)
        },
    },
    function (res) {
        let page = '';
        res.on('data', d => page += d);
        res.on('end', () => {
            const $ = cheerio.load(page);
            const errors = $('.datadisplaytable');
            if (errors.length != 0) {
                console.log(`==========================\nERRORS:\n${errors.html()}`);
            }
            const errors2 = $('.errortext');
            if (errors2.length != 0) {
                console.log(`==========================\nERRORS:\n${errors2.text()}`);
            }
            const classes = $('.dataentrytable');
            if (classes.length != 0) {
                console.log(`==========================\nCLASSES:\n${classes.html()}`);
            }

            if (errors.length == 0 && errors2.length == 0 && classes.length == 0) {
                console.log(page);
            }
        });
    }
);
enroll.on('error', console.error);
enroll.write(form);
enroll.end();
