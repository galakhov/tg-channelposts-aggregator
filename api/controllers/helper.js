const getUrls = require('get-urls')
const cleanMark = require('clean-mark')
const UdemyCrawler = require('./crawler')
const UrlCrawler = require('./urlParser')
const mongoose = require('mongoose')
const Post = mongoose.model('Post')
const normalizeUrl = require('normalize-url')
const urlTools = require('url')

const parseAndSaveCourse = (url, courseId = null) => {
  // delay the next call to the third-party api
  try {
    prepareUdemyCourseJSON(url, courseId)
    // let contentsSaved = null
  } catch (err) {
    console.error(getFullDate() + ' ADD_POST prepareUdemyCourseJSON ❌\n', err)
  }
}

const cleanUrl = url => {
  let cleanedUrl = url
  console.log(getFullDate() + ' cleanedUrl function: ', url)
  let posToEnd = url.indexOf('/?couponCode=')
  if (posToEnd === -1) {
    posToEnd = url.indexOf('/?&deal_code=')
  }
  if (posToEnd === -1) {
    posToEnd = url.indexOf('/?') // strict parameters cleaner
  }
  if (posToEnd !== -1) {
    cleanedUrl = url.substr(0, posToEnd)
  }
  if (cleanedUrl && cleanedUrl.length > 5) {
    // strip 'http(s)://' and the trailing slash in the end if any
    cleanedUrl = cleanedUrl.replace(/(^\w+:|^)\/\//, '')
    cleanedUrl = cleanedUrl.replace(/www\./, '')
    cleanedUrl = cleanedUrl.replace(/\/$/, '')
  } else {
    cleanedUrl = 0
  }

  console.log(getFullDate() + ' How cleaned url looks like:', cleanedUrl)
  console.log(
    getFullDate() + ' Cleaned url will be parsed & added? ',
    cleanedUrl.indexOf('udemy.com') !== -1
  )
  return cleanedUrl
}

const isAlreadyInDB = (cleanedUrl, crawledContents) => {
  // exit on duplicates
  if (cleanedUrl !== 0) {
    let urlPath = cleanUrl(cleanedUrl)
    urlPath = urlPath.replace(/udemy\.com/, '')
    urlPath = urlPath.replace(/course\//, '')
    try {
      console.log(
        getFullDate() + ' isAlreadyInDB: looking for this url path in DB: ',
        urlPath
      )
      Post.findOne({
        'preview.courseUrl': { $regex: urlPath, $options: 'i' }
      })
        .lean()
        .exec((err, result) => {
          if (result === null) {
            console.log(
              `${getFullDate()} The post with this URL isn't in DB ✅ `,
              cleanedUrl
            )
            const saveContents = populateUdemyCourseData(crawledContents)
            if (saveContents === false) {
              console.log(`${getFullDate()} Saving failed ❌`, saveContents)
            } else {
              console.log(
                `${getFullDate()} Contents were saved into DB 👍\n`,
                saveContents
              )
            }
          } else {
            console.error(
              `${getFullDate()} This post is already in DB. Stopping ❌`,
              cleanedUrl
            )
          }
        })
    } catch (e) {
      console.log('Invoked findOne function: queryResult error\n', e)
    }
  } else if (cleanedUrl === null || typeof cleanedUrl === 'undefined') {
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
      getFullDate() + ' How url without params looks like: ' + urlToCheck
    )
  }
  return urlToCheck
}

const prepareUdemyCourseJSON = async (url, courseId) => {
  const crawler = new UdemyCrawler({}, courseId)
  console.log(getFullDate() + ' prepareUdemyCourseJSON Crawling', 'Starting...')
  // const urlWithoutAffiliateParameters = affiliateParametersCleaner(url)
  console.log(getFullDate() + 'urlWithoutAffiliateParameters: ', url)
  return crawler.execute(url, (err, content) => {
    if (err) {
      return console.error(err.message)
    }
    console.log(getFullDate() + ' crawler contents\n', content)
    console.log(
      getFullDate() + ' prepareUdemyCourseJSON Crawling: Finished... 👍'
    )
    // try {
    if (content) {
      isAlreadyInDB(url, content)
    } else {
      console.error(getFullDate() + ' ADD_POST: contents were not parsed ❌')
    }
  })
}

const populateUdemyCourseData = contents => {
  console.log(getFullDate() + ' populateUdemyCourseData: ', 'Starting...')
  const NewPost = new Post()
  if (contents) {
    console.log(
      getFullDate() +
        ' populateUdemyCourseData: contents are being populated ✅'
    )
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
  } else {
    console.error(
      getFullDate() + ' populateUdemyCourseData: contents were not populated ❌'
    )
    return false
  }

  // save post only if the given url is valid and the contents were properly parsed
  const postStatus = NewPost.save()
    .then(post => {
      return post
        ? Promise.resolve(
            getFullDate() +
              ` populateUdemyCourseData: course contents saved! 👍\nPOST ID: ${
                post._id
              }`
          )
        : Promise.reject(
            getFullDate() +
              ' populateUdemyCourseData: contents WERE NOT saved into DB: ❌\n' +
              post
          )
    })
    .catch(err =>
      console.log(
        getFullDate() + ' populateUdemyCourseData: error while saving ❌\n',
        err
      )
    )
  // return true
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
