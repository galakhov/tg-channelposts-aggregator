const cheerio = require('cheerio')
const request = require('sync-request')

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

  execute(url) {
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

    const $ = cheerio.load(response.getBody())

    let href = $('body a').attr('href')

    if (!href) {
      // href = $('#content .elementor-button-link').attr('href')
      // eturn href.trim()
    } else if (href && href.length > 4) {
      return href.trim()
    } else {
      return new Error("Couldn't parse the requested page.")
    }
  }
}

module.exports = UrlCrawler
