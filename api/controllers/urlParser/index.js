const cheerio = require('cheerio')
const request = require('sync-request')
// const request = require('then-request')
const normalizeUrl = require('normalize-url')
const UserAgent = require('user-agents')

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

  syncParsing(url) {
    const userAgent = new UserAgent()
    console.log('-------- userAgent: ' + userAgent.toString())
    const newUserAgent = userAgent.toString()
    const result = request('GET', url, {
      headers: {
        'User-Agent': newUserAgent
      }
    })
    if (result.statusCode != 200) {
      console.log(
        'UrlCrawler -> syncParsing -> error statusCode',
        result.statusCode
      )
    }
    return result.getBody('utf8')
  }

  cheerioParsing(html, pathsToCheck) {
    console.log('-------- cheerioParsing', pathsToCheck)
    const $ = cheerio.load(html, {
      xml: {
        normalizeWhitespace: true,
        decodeEntities: true
      }
    }) // loading the requested page (connsidering redirections, etc.)
    // console.log('response.getBody()', $.html())
    let content = '',
      scrapedContent = []
    pathsToCheck.forEach(target => {
      // made as a universal parser: currently parses links & images
      content =
        $(target).attr('href') ||
        $(target).attr('data-src') ||
        $(target).attr('src')
      if (content && content.indexOf('http') !== -1) {
        console.log('-------- UrlCrawler -> found url(s):', content)
        const foundUrl = normalizeUrl(content.trim())
        scrapedContent.push(foundUrl)
      }
      content = ''
    })
    console.log('-------- scrapedContent', scrapedContent)

    if (scrapedContent.length > 0) {
      return scrapedContent[0]
    }
    return new Error("Couldn't parse the requested element(s).")
  }

  async execute(url, pathsToCheck = ['body a']) {
    // ASYNC
    try {
      const parsedContent = this.syncParsing(url)
      // console.log('parsedContent: ' + parsedContent)

      const parsedLink = this.cheerioParsing(parsedContent, pathsToCheck)
      console.log('-------- UrlCrawler -> execute -> parsedLink', parsedLink)
      return parsedLink
    } catch (error) {
      console.error('parsedContent ERROR:', error)
    }
  }

  // const options = {
  //   headers: {
  //     'User-Agent': newUserAgent
  //   },
  //   maxRetries: 3,
  //   retryDelay: 3000
  // }
  // syncRequest('GET', url, options).done(res => {
  //   response = res.getBody('utf8')
  //   if (!response || response.statusCode !== 200) {
  //     return new Error(
  //       "Can't find the requested URL. Response code: " + response.statusCode
  //     )
  //   }
  //   // cheerio parsing
  // })
}

module.exports = UrlCrawler
