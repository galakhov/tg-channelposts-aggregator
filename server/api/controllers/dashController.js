const _ = require('lodash')
const ctlHelper = require('./helper')
const limitPerPage = 100

const mongoose = require('mongoose'),
  Post = mongoose.model('Post')

const listAllPosts = (req, res) => {
  Post.find({}, (err, posts) => {
    if (err) {
      res.send(err)
    }
    res.json(posts)
  })
    .limit(limitPerPage)
    .sort({
      created_date: 'desc'
    })
}

const cleanUrl = url => {
  let cleanedUrl = url
  let posToEnd = url.indexOf('/?couponCode=')
  if (posToEnd === -1) {
    posToEnd = url.indexOf('/?&deal_code=')
  }
  if (posToEnd !== -1) {
    cleanedUrl = url.substr(0, posToEnd)
  }
  if (cleanedUrl && cleanedUrl.length > 5) {
    // strip 'http(s)://' and the trailing slash in the end
    cleanedUrl = cleanedUrl.replace(/(^\w+:|^)\/\//, '')
    cleanedUrl = cleanedUrl.replace(/\/$/, '')
  } else {
    cleanedUrl = 0
  }

  console.log('-------- How cleaned url looks like:', cleanedUrl)
  return cleanedUrl
}

const isDuplicate = cleanedUrl => {
  // exit on duplicates
  if (cleanedUrl !== 0) {
    let isInDB = true
    Post.findOne(
      { 'preview.url': { $regex: cleanedUrl, $options: 'i' } },
      async (err, response) => {
        if (response !== null) {
          console.error(
            '-------- This post was already added to DB before. Aborting.',
            cleanedUrl
          )
          isInDB = true
          // throw new Error('This post was already added to DB before. Aborting.')
        } else {
          if (err) {
            console.error('-------- DB query error', err)
          }
          isInDB = false
        }
      }
    )
    console.log('-------- isAlreadyInDB', isInDB)
    return isInDB
  }
  console.error('-------- URL is invalid')
  return false
}

const addPost = async data => {
  try {
    const NewPost = new Post()
    NewPost.raw = data
    NewPost.message_id = data.message_id

    let text = _.get(data, 'text', '') || _.get(data, 'caption', '')
    if (text && text.length < 1) {
      text = _.get(data, 'caption', '')
      console.log(
        '-------- ADD_POST: No text found. Getting caption instead',
        text
      )
    }
    const isSticker = _.get(data, 'sticker', '')
    console.log('-------- What is a type of a sticker?', typeof isSticker)
    console.log('-------- Inside of a sticker is nothing?', isSticker === '')
    const isThisAnAd = ctlHelper.isAd(text)

    if (!isThisAnAd && isSticker === '') {
      // TODO: extract the correct url (udemy.com)
      let url = ctlHelper.extractUrl(text)
      console.log('-------- ADD_POST parsed urls:', url)

      if (url.indexOf('udemyoff.com') !== -1) {
        const udemyOff = await ctlHelper
          .parseUrl(url, ['#content .wp-block-button__link'])
          .catch(err => console.error('-------- ADD_POST parseUdemyOff: ', err))
        console.log('-------- ADD_POST udemyOff parsed', udemyOff[0])
        url = udemyOff[0].indexOf('udemy.com') !== -1 ? udemyOff[0] : url
        console.log(
          '-------- save the link from the third-party site. Finishing...',
          url
        )
      } else if (url.indexOf('ift.tt/') !== -1) {
        const entities = _.get(data, 'entities', '')
        if (entities) {
          const foundUrlAtIndex = entities.findIndex(e =>
            e.url ? e.url.indexOf('udemy.com') !== -1 : false
          )
          console.log('-------- real.dicount URL: ', foundUrlAtIndex)

          if (foundUrlAtIndex === -1) {
            const parsedUrl = await ctlHelper
              .parseUrl(url, ['body a'])
              .catch(err =>
                console.error(
                  '-------- ADD_POST ctlHelper.parseUrl[body a]: ',
                  err
                )
              )
            if (parsedUrl[0] && parsedUrl[0].length > 7) {
              url = parsedUrl[0]
              console.log('-------- real.dicount url found', parsedUrl[0])
            }
          } else {
            url = entities[foundUrlAtIndex].url
            console.log('-------- real.dicount foundUrlAtIndex', url)
          }
        }
      } else if (url.indexOf('smartybro.com') !== -1) {
        const scrapedContent = await ctlHelper
          .parseUrl(url, [
            // '.sing-cont img',
            '.sing-cont .fasc-button'
          ])
          .catch(err =>
            console.error(
              '-------- ADD_POST ctlHelper.parseUrl[.sing-cont .fasc-button]: ',
              err
            )
          )
        url = scrapedContent[0]
        // the eduonix.com urls are blocked (no parser yet)
      }

      try {
        url = cleanUrl(url)
        // exit on a duplicate
        if (
          !isDuplicate(url) &&
          url.indexOf('udemyoff.com') === -1 &&
          url.indexOf('ift.tt/') === -1 &&
          url.indexOf('eduonix.com') === -1 &&
          url.indexOf('smartybro.com') === -1
        ) {
          // If post doesn't exist, continue...

          NewPost.preview.url = url

          NewPost.raw.text = ctlHelper.extractClutter(text)

          const chat = _.get(data, 'chat', {})
          NewPost.username = chat.username
          if (chat.type !== 'channel') {
            NewPost.username = chat.username
          } else {
            NewPost.username = chat.title
          }
          NewPost.chat_id = chat.id

          const tags = ctlHelper.extractHashtags(text)
          NewPost.tags = tags

          // crawl and parse contents
          let udemyContents = 'No udemy course found'

          if (url.indexOf('udemy.com') !== -1) {
            // do the parsing of udemy.com/course
            udemyContents = await ctlHelper
              .prepareUdemyCourseJSON(url)
              .catch(err =>
                console.error('-------- ADD_POST prepareUdemyCourseJSON: ', err)
              )

            // const udemyContent = JSON.parse(JSON.stringify(udemyContents))

            if (udemyContents) {
              NewPost.preview.courseContents = {}
              NewPost.preview.courseId = udemyContents.id
              NewPost.preview.courseUrl = udemyContents.url
              NewPost.preview.courseContents.text = udemyContents.description
              NewPost.preview.courseContents.author = udemyContents.authors
              NewPost.preview.courseContents.date = udemyContents.date
              NewPost.preview.courseContents.title = udemyContents.title
              NewPost.preview.courseContents.headline = udemyContents.headline
              NewPost.preview.courseContents.description =
                udemyContents.curriculum
              NewPost.preview.courseContents.keywords = udemyContents.topics.join(
                ', '
              )
              NewPost.preview.courseContents.url = udemyContents.image
            } else {
              console.error('-------- ADD_POST: ')
              // exit on Error: "Udemy page response with status 403" or other status than 200
              throw 'Error populating course contents'
            }
          }

          // save post only if the given url is valid and the contents were parsed
          NewPost.save((e, post) => {
            if (e) {
              console.error('-------- ADD_POST:')
              throw e
            }
          })
        } else {
          throw new Error('The post already exists. Aborting.')
        }
      } catch (e) {
        console.error('-------- ADD_POST: ', e)
      }
    } else {
      console.error('-------- ADD_POST: Channel’s ad/sticker was blocked')
      // throw new Error('Ad Blocked. Aborting.')
    }
  } catch (e) {
    console.error('-------- ADD_POST:')
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
        existingPost.preview.url = url
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
