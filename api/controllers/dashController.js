const _ = require('lodash')
const ctlHelper = require('./helper')
const mongoose = require('mongoose'),
  Post = mongoose.model('Post')

// mongoose.set('debug', true)

const maxLimit = 50
const listAllPosts = (req, callback = null) => {
  let { offset = 2000, limit = 50 } = req
  limit = Math.min(limit, maxLimit)
  console.log('-------- request', req)

  // const count = Post.estimatedDocumentCount()

  const query = Post.aggregate([
    // the order of the MongoDB stages below does matter
    { $match: { created_date: { $exists: 1 } } },
    { $skip: offset },
    { $sort: { created_date: -1 } }, // sort in descending order
    { $limit: limit }
  ]).allowDiskUse(true)
  // https://mongoosejs.com/docs/api.html#aggregate_Aggregate-allowDiskUse

  query.exec((err, results) => {
    if (err) {
      console.log('-------- aggregationResult err:\n' + err)
      return callback(err)
    }
    // console.log('-------- aggregationResult results:\n', results)
    return callback(null, results)
  })
}

const countPosts = (userId = null, postType, searchQuery = null) => {
  switch (postType) {
    // case 'search':
    //   return this.searchService.countFoundPosts(userId, searchQuery)
    case 'countPosts':
      return Post.estimatedDocumentCount()
    default:
      throw new Error(`${postType} is not a valid postType`)
  }
}

const isThirdPartyLink = url => {
  const nonOriginalUdemyLink =
    url.indexOf('udemyoff.com') !== -1 ||
    url.indexOf('ift.tt/') !== -1 ||
    url.indexOf('eduonix.com') !== -1 ||
    url.indexOf('smartybro.com') !== -1 ||
    url.indexOf('udemy.com%2F') !== -1 // partner link referring udemy?

  if (nonOriginalUdemyLink) {
    console.error(
      ctlHelper.getFullDate() + ' ADD_POST isThirdPartyLink found:\n',
      nonOriginalUdemyLink
    )
  }
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
          ctlHelper.getFullDate() + ' ADD_POST start UdemyOff Parser:\n',
          err
        )
      )
    const urlToParse = udemyOff
    console.log(
      ctlHelper.getFullDate() +
        ' Saving the link from the third-party site. Finishing...'
    )
    console.log(
      ctlHelper.getFullDate() + ' ADD_POST udemyOff parsed ❓❓❓',
      urlToParse
    )
    return urlToParse
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
        ctlHelper.getFullDate() + ' real.dicount URL:\n',
        foundUrlInDBAtIndex
      )

      // if no udemy.com url was found in entities, start plan B case
      if (foundUrlInDBAtIndex === -1) {
        const parsedUrl = await ctlHelper
          .parseUrl(urlToParse, ['.deal-sidebar-box a'])
          .then(foundUrl => {
            if (foundUrl && foundUrl.length > 7) {
              console.log(
                ctlHelper.getFullDate() + ' real.dicount url found',
                foundUrl
              )
              return foundUrl
            } else {
              console.log('startRealDiscountParser -> urlToParse', urlToParse)
              return foundUrl
            }
          })
          .catch(err => {
            console.error(
              ctlHelper.getFullDate() +
                ' ADD_POST ctlHelper.parseUrl[body a]:\n',
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
    await ctlHelper
      .parseUrl(url, ['.sing-cont .fasc-button'])
      .then(res => {
        url = res
      })
      .catch(err =>
        console.error(
          ctlHelper.getFullDate() +
            ' ADD_POST ctlHelper.parseUrl[.sing-cont .fasc-button]:\n',
          err
        )
      )
    // the eduonix.com urls are blocked (no parser implemented yet)
    return url
  } catch (err) {
    console.error(ctlHelper.getFullDate() + ' startSmatrybroParser\n', err)
  }
}

const addPost = async data => {
  try {
    let text = _.get(data, 'text', '') || _.get(data, 'caption', '')
    // console.log('addPost: text:\n', text)
    if (!text || text === '' || text.length < 1) {
      console.log(
        ctlHelper.getFullDate() +
          ' ADD_POST: No text found. Getting caption instead',
        data
      )
    }
    const isSticker = _.get(data, 'sticker', '')
    const isThisAnAd = ctlHelper.isAd(text)

    if (!isThisAnAd && isSticker === '') {
      // grab url from the channel's post
      let url = ctlHelper.extractUrl(text)
      console.log(ctlHelper.getFullDate() + ' ADD_POST parsed urls:\n', url)

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
        if (url) {
          url = ctlHelper.affiliateParametersCleaner(url)
          if (!isThirdPartyLink(url) && url.indexOf('udemy.com/') !== -1) {
            // do the parsing of a udemy course
            ctlHelper.parseAndSaveCourse(url)
          } else {
            console.error(
              ctlHelper.getFullDate() + ' addPost third Party Link:\n',
              url
            )
          }
        } else {
          console.log(
            ctlHelper.getFullDate() + ' addPost url was not found:\n',
            data
          )
        }
      } catch (e) {
        console.error(
          ctlHelper.getFullDate() +
            ' ADD_POST the link is already in DB or query error:\n',
          e
        )
      }
    } else {
      console.error(
        ctlHelper.getFullDate() + ' ADD_POST: Channel’s ad/sticker was blocked'
      )
    }
  } catch (e) {
    console.error(ctlHelper.getFullDate() + ' ADD_POST FINAL:\n')
    throw e
  }
}

const updatePost = ({ edited_channel_post: data }) => {
  try {
    Post.findOne({ message_id: data.message_id }, async (err, existingPost) => {
      console.log('----- POST FOUND', existingPost)
      if (existingPost) {
        // previews
        const url = ctlHelper.extractUrl(text)
        existingPost.preview.url = url // consinder using courseUrl
        if (url) {
          const courseContents = await ctlHelper
            .prepareUdemyCourseJSON(url)
            .catch(err =>
              console.error(
                '-------- UPDATE_POST prepareUdemyCourseJSON:\n',
                err
              )
            )

          try {
            existingPost.preview.courseContents = JSON.parse(
              JSON.stringify(courseContents)
            )
          } catch (e) {
            console.error(
              '-------- UPDATE_POST courseContents:\n',
              existingPost
            )
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
exports.countPosts = countPosts
