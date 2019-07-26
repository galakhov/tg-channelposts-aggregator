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

const isDuplicate = url => {
  // exit on duplicates
  const cleanedUrl = url
    ? url.replace(/(^\w+:|^)\/\//, '').replace(/\/$/, '')
    : 0

  if (cleanedUrl !== 0) {
    Post.findOne(
      { 'preview.url': { $regex: cleanedUrl, $options: 'i' } },
      function(err, response) {
        if (response !== null) {
          console.error(
            '-------- this post is already in DB. Aborting.',
            cleanedUrl
          )
          return true
        } else {
          if (err) {
            console.error('-------- DB query error', err)
          }
          return false
        }
      }
    )
  }
  console.error('-------- URL query error')
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

    const isThisAnAd = ctlHelper.isAd(text)
    if (!isThisAnAd) {
      // TODO: extract the correct url (udemy.com)
      let url = ctlHelper.extractUrl(text)
      console.log('-------- ADD_POST parsed urls:', url)

      if (url.indexOf('udemyoff.com') !== -1) {
        const udemyOff = await ctlHelper
          .parseUdemyOff(url)
          .catch(err => console.error('-------- ADD_POST parseUdemyOff: ', err))
        console.log('-------- ADD_POST udemyOff parsed', udemyOff)
        url = udemyOff.indexOf('udemy.com') !== -1 ? udemyOff : url
        console.log(
          'parse the link from the third-party site. Finishing...',
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
            // TODO: get the name of the course from the text
            const reg = /100% Off] (.*?)Udemy Coupon/
            let courseName = text.match(reg)
            courseName = courseName[1] ? courseName[1].trim() : 'No name found'
            console.log('-------- real.dicount courseName', courseName)

            // TODO: discover url by udemy's course name
            const parsedUrl = ctlHelper.parseUrl(url)
            if (parsedUrl && parsedUrl.length > 7) {
              url = parsedUrl
              console.log('-------- real.dicount url discovered', parsedUrl)
            }
          } else {
            url = entities[foundUrlAtIndex].url
            console.log('-------- real.dicount foundUrlAtIndex', url)
          }
        }
      }

      try {
        // exit on a duplicate
        if (
          !isDuplicate(url) &&
          url.indexOf('udemyoff.com') === -1 &&
          url.indexOf('ift.tt/') === -1
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
          throw new Error('Post already exists. Aborting.')
        }
      } catch (e) {
        console.error('-------- ADD_POST: ', e)
      }
    } else {
      console.error('-------- ADD_POST: Channel’s ad was blocked')
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
