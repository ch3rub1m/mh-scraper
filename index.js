const http = require('http')
const iconv = require('iconv-lite')
const cheerio = require('cheerio')
const fs = require('fs')

const site = 'http://gamemo.sakura.ne.jp/mhp2/'
const paths = [
  'arm-head.html',
  'arm-body.html',
  'arm-arm.html',
  'arm-waist.html',
  'arm-leg.html'
]

const fetchPage = (url) => {
  return new Promise((resolve, reject) => {
    let htmlData = []
    let htmlDataLength = 0
    http.get(url, (res) => {
      res.on('data', (data) => {
        htmlData.push(data)
        htmlDataLength += data.length
      })
      res.on('end', () => {
        const bufferHtmlData = Buffer.concat(htmlData, htmlDataLength)
        const decodeHtmlData = iconv.decode(bufferHtmlData, 'shift_jis')
        const $ = cheerio.load(decodeHtmlData)
        resolve($)
      })
    })
  })
}

const appendFile = (filePath, data) => {
  return new Promise((resolve, reject) => {
    fs.appendFile(filePath, data, () => {
      resolve()
    })
  })
}

const start = async (site, paths) => {
  for (let path of paths) {
    const fileName = path.split('.')[0]
    const filePath = `${__dirname}/${fileName}.txt`
    const url = site + path
    const $ = await fetchPage(url)
    $('tr').each(async function () {
      const $tds = $(this).children()
      let line = ''
      if ($tds.length === 7) {
        $tds.each(function () {
          const $td = $(this)
          const content = $td.text()
          line += content + '|||'
        })
      }
      const length = line.length
      line = line.slice(0, length - 3) + '\n'
      await appendFile(filePath, line)
    })
  }
}

start(site, paths)
