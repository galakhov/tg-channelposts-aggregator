const cheerio = require('cheerio')
const request = require('sync-request')
const normalizeUrl = require('normalize-url')

class UrlCrawler {
  constructor(config) {
    this.config = config || {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'max-age=0'
      }
    }
  }

  execute(url, pathsToCheck = ['a']) {
    const response = request('GET', url, {
      headers: {
        'User-Agent': this.config.headers['User-Agent']
      }
    })

    if (response.statusCode !== 200) {
      return new Error(
        "Can't find the requested URL. Response code: " + response.statusCode
      )
    }
    console.log(response.getBody())
    const $ = cheerio.load(response.getBody()) // entering the <body>

    let content = ''
    const scrapedContent = []

    pathsToCheck.forEach(target => {
      // universal parser: currently works with links & images
      content =
        $(target).attr('href') ||
        $(target).attr('data-src') ||
        $(target).attr('src')
      if (content && content.indexOf('http') !== -1) {
        console.log('UrlCrawler -> found url:', content)
        const foundUrl = normalizeUrl(content.trim())
        scrapedContent.push(foundUrl)
      }
      content = ''
    })

    console.log('-------- scrapedContent', scrapedContent)

    if (scrapedContent.length > 0) {
      return scrapedContent
    }
    return new Error("Couldn't parse the requested element(s).")
  }
}

module.exports = UrlCrawler
