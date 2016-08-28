#!/usr/bin/env node
'use strict';

var rp = require('request-promise');
var cheerio = require('cheerio');
var Table = require('cli-table');
var numeral = require('numeral');
var ora = require('ora');
var chalk = require('chalk');
var logUpdate = require('log-update');

var baseUrl = 'https://my.smartfren.com/api/device/profile.php';
var deviceType = 'Router';
var swVersion = 'Andromax.M2S.V10_L_V2.3';
var browser = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36';

var spinner = ora();
var table = new Table();

setInterval(function() {
    logUpdate('\n\n  ' + spinner.frame() + '\n');
}, 50);

var options = {
    method: 'POST',
    uri: baseUrl,
    form: {
        imsi: process.env.SMARTFREN_IMSI,
        token: process.env.SMARTFREN_TOKEN,
        device_type: deviceType,
        sw_version: swVersion,
        browser: browser
    }
};

rp(options)
.then(function (body) {
    var $ = cheerio.load(body);
    var infoTable = $('table').eq(1);
    var nomor = $(infoTable).find('tr').eq(0).find('td').eq(2).text();
    var paket = $(infoTable).find('tr').eq(2).find('td').eq(2).text();
    var berlaku = $(infoTable).find('tr').eq(3).find('td').eq(2).text();
    var kuota = $(infoTable).find('tr').eq(4).find('td').eq(2).text();
    kuota = kuota.split(' ')[0];
    kuota = numeral(kuota).format('0,0').toString().concat(' KB');


    table.push(['Nomor', nomor]);
    table.push(['Paket', paket]);
    table.push(['Berlaku', berlaku]);
    table.push(['Kuota', kuota]);

    logUpdate(table.toString());
    process.exit();
})
.catch(function (err) {
    console.log(err);
});
