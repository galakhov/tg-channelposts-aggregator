const _ = require('lodash')
const ctlHelper = require('./helper')
const normalizeUrl = require('normalize-url')
const urlTools = require('url')

const limitPerPage = 100

const mongoose = require('mongoose'),
  Post = mongoose.model('Post')

// mongoose.set('debug', true)

const listAllPosts = (req, res) => {
  Post.find({}, (err, posts) => {
    if (err) {
      console.log('listAllPosts -> err:', err)
      res.send(err)
    }
    res.json(posts)
  })
    .sort({
      created_date: 'desc'
    })
    .limit(limitPerPage)
}

const cleanUrl = url => {
  let cleanedUrl = url
  console.log(ctlHelper.getFullDate() + ' cleanedUrl', url)
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
    cleanedUrl = cleanedUrl.replace(/\/$/, '')
    cleanedUrl = cleanedUrl.replace(/www\./, '')
  } else {
    cleanedUrl = 0
  }

  console.log(
    ctlHelper.getFullDate() + ' How cleaned url looks like:',
    cleanedUrl
  )
  console.log(
    ctlHelper.getFullDate() + ' Cleaned url will be parsed & added? ',
    cleanedUrl.indexOf('udemy.com') !== -1
  )
  return cleanedUrl
}

const isThirdPartyLink = url => {
  const nonOriginalUdemyLink =
    url.indexOf('udemyoff.com') !== -1 ||
    url.indexOf('ift.tt/') !== -1 ||
    url.indexOf('eduonix.com') !== -1 ||
    url.indexOf('smartybro.com') !== -1
  return nonOriginalUdemyLink
}

const timeoutBeforeNextRequest = ms => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const startUdemyOffParser = async url => {
  try {
    const udemyOff = await ctlHelper
      .parseUrl(url, ['#content .wp-block-button__link'])
      .catch(err =>
        console.error(
          ctlHelper.getFullDate() + ' ADD_POST parseUdemyOff: ',
          err
        )
      )
    console.log(
      ctlHelper.getFullDate() + ' ADD_POST udemyOff parsed',
      udemyOff[0]
    )
    url = udemyOff[0].indexOf('udemy.com') !== -1 ? udemyOff[0] : url
    console.log(
      ctlHelper.getFullDate() +
        ' Saving the link from the third-party site. Finishing...'
    )
    console.log(url)
    return url
  } catch (err) {
    console.error(ctlHelper.getFullDate() + ' startUdemyOffParser', err)
  }
}

const startRealDiscountParser = async (urlToParse, entities) => {
  try {
    console.log(ctlHelper.getFullDate() + ' entities', entities)
    // if there are any Post's entities from Telegram's Channel
    if (entities) {
      // look for the url field in the DB itself: returns -1 if no match
      const foundUrlInDBAtIndex = entities.findIndex(entity =>
        entity.url ? entity.url.indexOf('udemy.com') !== -1 : false
      )
      console.log(
        ctlHelper.getFullDate() + ' real.dicount URL: ',
        foundUrlInDBAtIndex
      )

      // if no udemy.com url was found in entities, start plan B case
      if (foundUrlInDBAtIndex === -1) {
        // curl -4 https://ift.tt/2Xv2ddp --> <body><a href="..."></a></body>
        const parsedUrl = await ctlHelper
          .parseUrl(urlToParse, ['.deal-sidebar-box a'])
          .then(foundUrl => {
            if (foundUrl[0] && foundUrl[0].length > 7) {
              console.log(
                ctlHelper.getFullDate() + ' real.dicount url found',
                foundUrl[0]
              )
              return foundUrl[0]
            } else {
              console.log('startRealDiscountParser -> urlToParse', urlToParse)
              return foundUrl
            }
          })
          .catch(err => {
            console.error(
              ctlHelper.getFullDate() +
                ' ADD_POST ctlHelper.parseUrl[body a]: ',
              err
            )
            return false
          })
        return parsedUrl
      } else {
        urlToParse = entities[foundUrlInDBAtIndex].url
        console.log(
          ctlHelper.getFullDate() + ' real.dicount foundUrlInDBAtIndex',
          urlToParse
        )
        return urlToParse
      }
    }
    return urlToParse
  } catch (err) {
    console.error(ctlHelper.getFullDate() + ' startRealDiscountParser', err)
    return false
  }
}

const startSmatrybroParser = async url => {
  try {
    const scrapedContent = await ctlHelper
      .parseUrl(url, [
        // '.sing-cont img',
        '.sing-cont .fasc-button'
      ])
      .catch(err =>
        console.error(
          ctlHelper.getFullDate() +
            ' ADD_POST ctlHelper.parseUrl[.sing-cont .fasc-button]: ',
          err
        )
      )
    url = scrapedContent[0]
    // the eduonix.com urls are blocked (no parser yet)
    return url
  } catch (err) {
    console.error(ctlHelper.getFullDate() + ' startSmatrybroParser', err)
  }
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

const addPost = async data => {
  try {
    let text = _.get(data, 'text', '') || _.get(data, 'caption', '')
    if (text && text.length < 1) {
      text = _.get(data, 'caption', '')
      console.log(
        ctlHelper.getFullDate() +
          ' ADD_POST: No text found. Getting caption instead',
        text
      )
    }
    const isSticker = _.get(data, 'sticker', '')
    const isThisAnAd = ctlHelper.isAd(text)

    if (!isThisAnAd && isSticker === '') {
      // grab url from the channel's post
      let url = ctlHelper.extractUrl(text)
      console.log(ctlHelper.getFullDate() + ' ADD_POST parsed urls:', url)

      if (url.indexOf('udemyoff.com') !== -1) {
        url = await startUdemyOffParser(url)
      } else if (url.indexOf('ift.tt/') !== -1) {
        // get entities from the Post on Telegram's Channel
        const entities = _.get(data, 'entities', '')
        url = await startRealDiscountParser(url, entities)
      } else if (url.indexOf('smartybro.com') !== -1) {
        url = await startSmatrybroParser(url)
      }

      try {
        const urlWithoutParameters = cleanUrl(url)
        // exit the process if duplicates exist in DB
        let isLinkAlreadyInDB = await ctlHelper.isAlreadyInDB(
          urlWithoutParameters
        )
        if (
          // If the course link isn't in DB, continue...
          typeof isLinkAlreadyInDB !== 'undefined' &&
          !isLinkAlreadyInDB &&
          !isThirdPartyLink(url)
        ) {
          url = affiliateParametersCleaner(url)

          // NewPost.raw = data
          // NewPost.message_id = data.message_id
          // NewPost.preview.url = url

          // NewPost.raw.text = ctlHelper.extractClutter(text)

          // const chat = _.get(data, 'chat', {})
          // NewPost.username = chat.username
          // if (chat.type !== 'channel') {
          //   NewPost.username = chat.username
          // } else {
          //   NewPost.username = chat.title
          // }
          // NewPost.chat_id = chat.id

          // const tags = ctlHelper.extractHashtags(text)
          // NewPost.tags = tags

          // crawl and parse contents
          if (
            url.indexOf('https://www.udemy.com/') !== -1 ||
            url.indexOf('https://udemy.com/') !== -1
          ) {
            // do the parsing of a udemy course
            ctlHelper.parseAndSaveCourse(url)
            // udemyContents = parsedCourseContents
          }
        } else {
          throw new Error('The post is already in DB. Aborting.')
        }
      } catch (e) {
        console.error(ctlHelper.getFullDate() + ' ADD_POST: ', e)
      }
    } else {
      console.error(
        ctlHelper.getFullDate() + ' ADD_POST: Channel’s ad/sticker was blocked'
      )
      // throw new Error('Ad Blocked. Aborting.')
    }
  } catch (e) {
    console.error(ctlHelper.getFullDate() + ' ADD_POST:')
    throw e
  }
}

const updatePost = ({ edited_channel_post: data }) => {
  try {
    Post.findOne({ message_id: data.message_id }, async (err, existingPost) => {
      console.log('----- FOUND', existingPost)
      if (existingPost) {
        const chat = _.get(data, 'chat', {})
        let text = _.get(data, 'text', '') || _.get(data, 'caption', '')
        if (text && text.length < 1) {
          text = _.get(data, 'caption', '')
        }

        existingPost.tags = ctlHelper.extractHashtags(text)
        existingPost.raw = data
        if (chat.type !== 'channel') {
          existingPost.username = chat.username
        }
        existingPost.chat_id = chat.id

        // previews
        const url = ctlHelper.extractUrl(text)
        existingPost.preview.url = url // consinder using courseUrl
        if (url) {
          const courseContents = await ctlHelper
            .prepareUdemyCourseJSON(url)
            .catch(err =>
              console.error(
                '-------- UPDATE_POST prepareUdemyCourseJSON: ',
                err
              )
            )

          try {
            existingPost.preview.courseContents = JSON.parse(
              JSON.stringify(courseContents)
            )
          } catch (e) {
            console.error('-------- UPDATE_POST courseContents:', existingPost)
          }
        }

        existingPost.save((e, existingPost) => {
          if (e) {
            throw e
          }
        })
      }
    })
  } catch (e) {
    console.error('-------- UPDATE_POST: ')
    throw e
  }
}

exports.listAllPosts = listAllPosts
exports.addPost = addPost
exports.updatePost = updatePost
