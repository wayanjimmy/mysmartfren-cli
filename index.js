#!/usr/bin/env node
const rp = require('request-promise')
const cheerio = require('cheerio')
const Table = require('cli-table')
const numeral = require('numeral')
const ora = require('ora')
const chalk = require('chalk')
const logUpdate = require('log-update')
const fs = require('fs')
const clc = require('cli-color')
const _ = require('lodash')

const baseUrl = 'https://my.smartfren.com/api/device/profile.php'
const homedir = (process.platform === 'win32') ? process.env.HOMEPATH : process.env.HOME;
const smartfile = homedir + '/.mysmartfren';

let spinner = ora()
let table = new Table()
let yellow = clc.yellow
let blue = clc.blue
let cyan = clc.cyan
let magenta = clc.magenta

const setConfigFile = (imsi, token) => {
  fs.writeFile(smartfile, imsi + '|' + token, err => {
    if (err) throw err
    console.log(cyan('Config disimpan.'))
  })
}

const fileError = () => {
  console.log('  ')
  console.log(cyan('IMSI dan TOKEN belum dikonfigurasi'))
  console.log(cyan("Contoh: ") + magenta("mysmartfren-cli -imsi 'imsi' -token 'token'"))
  console.log(' ')
  process.exit(code=0)
}

const readConfigFile = () => {
  let config;
  try {
    config = fs.readFileSync(smartfile, 'utf8')
  } catch (el) {
    fileError()
  }

  if (config === '') {
    fileError()
  }
  return fs.readFileSync(smartfile, 'utf8')
}

const details = () => {
  let config = readConfigFile().split('|')

  setInterval(() => {
    logUpdate('\n\n  ' + spinner.frame() + '\n');
  }, 50);

  let options = {
    method: 'POST',
    uri: baseUrl,
    form: {
      imsi: config[0],
      token: config[1]
    }
  }

  rp(options)
  .then(function (body) {
    let $ = cheerio.load(body)
    let infoTable = $('table').eq(1)
    let nomor = $(infoTable).find('tr').eq(0).find('td').eq(2).text()
    let paket = $(infoTable).find('tr').eq(2).find('td').eq(2).text()
    let berlaku = $(infoTable).find('tr').eq(3).find('td').eq(2).text()
    let kuota = $(infoTable).find('tr').eq(4).find('td').eq(2).text()

    table.push(['Nomor', nomor])
    table.push(['Paket', paket])
    table.push(['Berlaku', berlaku])
    table.push(['Kuota', kuota])

    logUpdate(table.toString())
    process.exit()
  })
  .catch(function (err) {
    console.log(err)
  })
}

if (process.argv.length == 2) {
  details()
} else {
  let args = _.chain(process.argv).filter((val, index) => index > 1).chunk(2)
  let imsi = _.chain(args).filter(val => val[0] == '-imsi').flatten().value()[1]
  let token = _.chain(args).filter(val => val[0] == '-token').flatten().value()[1]

  setConfigFile(imsi, token)
}

