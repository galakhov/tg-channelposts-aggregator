const getUrls = require('get-urls')
const cleanMark = require('clean-mark')
const UdemyCrawler = require('./crawler')
const UrlCrawler = require('./urlParser')
// const nodeMercuryParser = require('node-mercury-parser')
// nodeMercuryParser.init(process.env.MERCURY_PARSER_KEY)

const crawler = new UdemyCrawler({
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
    'upgrade-insecure-requests': 1
  }
})

const getFullDate = () => {
  const date = new Date()
  const dd = date.getUTCDate()
  let mm = date.getMonth() + 1
  mm = mm < 10 ? '0' + mm : mm
  const yyyy = date.getFullYear()
  const fullDate = `${dd}.${mm}.${yyyy} at ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
  return fullDate
}

// TODO: refactor
const parseUrl = async (url, paths = ['a']) => {
  console.log(
    getFullDate() + ' parseUrl: parsing of the link from the third-party site',
    'Starting...'
  )
  const urlParser = new UrlCrawler()
  return urlParser.execute(url, paths)
}

const prepareUdemyCourseJSON = async url => {
  console.log(getFullDate() + ' prepareUdemyCourseJSON', 'Starting...')
  return crawler.execute(url, (err, content) => {
    if (err) {
      return console.error(err.message)
    }
    console.log(content)
    console.log(getFullDate() + ' prepareUdemyCourseJSON: parsing finished...')
    return content
  })
}

const extractTags = text => {
  if (!text) return ['untagged']
  const extractedTags = text.match(/\[(.*?)\]/g) // ['[Design]', '[Code]', ...]
  const tags =
    extractedTags &&
    extractedTags.map(t => t.replace(/[\[ | \]]/g, '').toLowerCase()) // ['design', 'code', ...]
  return tags.length > 0 ? tags : ['untagged']
}

const extractClutter = text => {
  const filteredString = text.replace(/@multifeed_edge_bot/g, '')
  return filteredString
}

const extractHashtags = text => {
  if (!text) return ['untagged']
  const extractedTags = text.match(/\#(.*?)\ /g) // ['#tag ', '#foo ']
  const tags = extractedTags && extractedTags.map(t => t.replace(/[# ]/g, ''))
  if (tags) return tags.length > 0 ? tags : ['untagged']
  return ['untagged']
}

const replaceAll = (originalString, findRegExp, replace) => {
  return originalString.replace(new RegExp(findRegExp, 'g'), replace)
}

const extractUrl = text => {
  // https://github.com/sindresorhus/normalize-url#options
  const urlSet = getUrls(text, { stripWWW: false })
  const urlArr = Array.from(urlSet)
  let offset = 4
  if (urlArr[0]) {
    let rightPartOfUrlPosition = urlArr[0].search(/.com/gm)

    // fix urls with '.com' ending only
    if (rightPartOfUrlPosition !== -1) {
      const leftPart = urlArr[0].substr(0, rightPartOfUrlPosition + offset)
      const rightPart = urlArr[0].substr(rightPartOfUrlPosition + offset)
      return `${leftPart}${replaceAll(rightPart, /\./, '')}`
    }
    return urlArr[0]
  }
  return ''
}

const preparePreviewMark = async url => {
  return cleanMark(url, {})
}

const isAd = text => {
  if (text.match(/@RegularPromos/gi) || text.match(/@Black Promotions/gi)) {
    return true
  }
  return false
}

exports.getFullDate = getFullDate
exports.extractTags = extractTags
exports.extractHashtags = extractHashtags
exports.extractClutter = extractClutter
exports.extractUrl = extractUrl
exports.preparePreviewMark = preparePreviewMark
exports.prepareUdemyCourseJSON = prepareUdemyCourseJSON
exports.parseUrl = parseUrl
exports.isAd = isAd
exports.replaceAll = replaceAll
