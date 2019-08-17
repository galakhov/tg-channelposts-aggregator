const getUrls = require('get-urls')
const cleanMark = require('clean-mark')
const UdemyCrawler = require('./crawler')
const UrlCrawler = require('./urlParser')
const mongoose = require('mongoose')
const Post = mongoose.model('Post')
const normalizeUrl = require('normalize-url')
const urlTools = require('url')
// const nodeMercuryParser = require('node-mercury-parser')
// nodeMercuryParser.init(process.env.MERCURY_PARSER_KEY)

const parseAndSaveCourse = (url, courseId = null) => {
  setTimeout(() => {
    // delay the next call to the third-party api
    let contents = null
    try {
      contents = prepareUdemyCourseJSON(url, courseId)
      // let contentsSaved = null
    } catch (err) {
      console.error(
        getFullDate() + ' ADD_POST prepareUdemyCourseJSON ❌\n',
        err
      )
    }
  }, 0)
}

const isAlreadyInDB = cleanedUrl => {
  // exit on duplicates
  if (cleanedUrl !== 0) {
    let isInDB = true
    cleanedUrl = cleanedUrl.replace(/https:\/\/udemy\.com/, '')
    cleanedUrl = cleanedUrl.replace(/course\//, '')
    console.log(
      getFullDate() + ' isAlreadyInDB: comparing this cleaned url: ',
      cleanedUrl
    )
    return Post.findOne(
      { 'preview.courseUrl': { $regex: cleanedUrl, $options: 'i' } },
      async (err, response) => {
        const result = await response
        if (result !== null) {
          console.warn(
            getFullDate() +
              ' This post was already added to DB before. Aborting. ❌',
            cleanedUrl
          )
          isInDB = true
          console.log(getFullDate() + ' isAlreadyInDB ❌', isInDB)
          return isInDB
          // throw new Error('This post was already added to DB before. Aborting.')
        } else {
          if (err) {
            console.error(getFullDate() + ' DB query error ❌', err)
          }
          isInDB = false
          console.log(getFullDate() + ' isAlreadyInDB ✅', isInDB)
          return isInDB
        }
      }
    )
    // return isInDB
  } else if (cleanedUrl === null || cleanedUrl === 'undefined') {
    cleanedUrl
    console.error(
      getFullDate() + ' isAlreadyInDB: URL is invalid ❌ ' + cleanedUrl
    )
    return false
  }
}

// for logging purposes
const getFullDate = (d = new Date()) => {
  const date = d // typeof d === 'string' ? new Date(d) : d
  const dd = date.getUTCDate()
  let mm = date.getUTCMonth() + 1
  mm = mm < 10 ? `0${mm}` : mm
  const yyyy = date.getUTCFullYear()
  let hh = date.getUTCHours() + 2
  hh = hh.toString().length < 2 ? `0${hh}` : hh
  let min = date.getUTCMinutes()
  min = min.toString().length < 2 ? `0${min}` : min
  let sec = date.getUTCSeconds()
  sec = sec.toString().length < 2 ? `0${sec}` : sec
  let msec = date.getUTCMilliseconds()
  msec =
    msec.toString().length > 1 && msec.toString().length < 3
      ? `0${msec}`
      : msec.toString().length < 2
      ? `00${msec}`
      : msec
  const fullDate = `${dd}.${mm}.${yyyy} at ${hh}:${min}:${sec}:${msec}`
  return fullDate
}

const parseUrl = async (url, paths = ['body a']) => {
  console.log(
    getFullDate() + ' parseUrl: parsing of the link from the third-party site',
    'Starting...'
  )
  const urlParser = new UrlCrawler()
  return urlParser.execute(url, paths)
}

const affiliateParametersCleaner = urlToCheck => {
  const offset = urlToCheck.indexOf('LSNPUBID=') || -1
  let couponCode = null
  if (offset !== -1) {
    const objUrl = new urlTools.URL(normalizeUrl(urlToCheck))
    couponCode = objUrl.searchParams.get('couponCode') || null
    urlToCheck = `https://${objUrl.hostname}${objUrl.pathname}`

    urlToCheck =
      couponCode !== null && couponCode !== ''
        ? (urlToCheck += `?couponCode=${couponCode}`)
        : urlToCheck
    console.log(
      ctlHelper.getFullDate() +
        ' How url without params looks like: ' +
        urlToCheck
    )
  }
  return urlToCheck
}

const prepareUdemyCourseJSON = async (url, courseId) => {
  const crawler = new UdemyCrawler({}, courseId)
  console.log(getFullDate() + ' prepareUdemyCourseJSON Crawling', 'Starting...')
  const urlWithoutAffiliateParameters = affiliateParametersCleaner(url)
  return crawler.execute(urlWithoutAffiliateParameters, (err, content) => {
    if (err) {
      return console.error(err.message)
    }
    console.log(
      getFullDate() + ' prepareUdemyCourseJSON Crawling: Finished...👍'
    )
    // console.log(content)
    // try {
    if (content !== null) {
      contentsSaved = populateUdemyCourseData(content)
      if (contentsSaved !== null) {
        console.log(getFullDate() + ' contentsSaved ✅', contentsSaved)
        return contentsSaved
      } else {
        // exit on: "Udemy page response of 403" or other status than 200
        console.error(
          getFullDate() + ' ADD_POST: contents were not parsed yet ❌'
        )
        throw 'Error connecting to the course platform ❌\n'
      }
    } // else {
    //   console.error(
    //     getFullDate() + ' ADD_POST: contents were not parsed yet ❌'
    //   )
    // }
    // } catch (e) {
    //  console.error(getFullDate() + e + ' ❌')
    // }
    // return content
  })
}

const populateUdemyCourseData = async contents => {
  console.log(getFullDate() + ' populateUdemyCourseData ', 'Starting...')
  const NewPost = new Post()
  NewPost.preview.courseContents = {}
  NewPost.preview.courseId = contents.id
  NewPost.preview.courseUrl = contents.url
  NewPost.preview.courseContents.text = contents.description
  NewPost.preview.courseContents.audiences = contents.audiences
  NewPost.preview.courseContents.author = contents.authors
  NewPost.preview.courseContents.date = contents.date
  NewPost.preview.courseContents.discountInPercent = contents.discount
  NewPost.preview.courseContents.discountExpirationDate =
    contents.discountExpiration
  NewPost.preview.courseContents.currentPrice = contents.price
  NewPost.preview.courseContents.initialPrice = contents.fullPrice
  NewPost.preview.courseContents.title = contents.title
  NewPost.preview.courseContents.headline = contents.headline
  NewPost.preview.courseContents.enrolled = contents.enrollmentNumber
  NewPost.preview.courseContents.rating = contents.rating
  NewPost.preview.courseContents.lectures = contents.curriculum
  NewPost.preview.courseContents.keywords = contents.topics.join(', ')
  NewPost.preview.courseContents.language = contents.language
  NewPost.preview.courseContents.url = contents.image

  // save post only if the given url is valid and the contents were properly parsed
  const postStatus = NewPost.save().then(post => {
    return post
      ? getFullDate() +
          ` ADD_POST: course contents saved! 👍 POST ID: ${post._id}`
      : getFullDate() + ' ADD_POST: contents couldn’t be saved into DB: ' + post
  })
  return postStatus
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
exports.isAlreadyInDB = isAlreadyInDB
exports.parseAndSaveCourse = parseAndSaveCourse
exports.affiliateParametersCleaner = affiliateParametersCleaner
