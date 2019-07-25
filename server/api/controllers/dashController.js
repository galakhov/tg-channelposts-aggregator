const _ = require('lodash')
const ctlHelper = require('./helper')
const limitPerPage = 100

const mongoose = require('mongoose'),
  Msg = mongoose.model('Msg')

const list_all_msgs = (req, res) => {
  Msg.find({}, (err, msgs) => {
    if (err) {
      res.send(err)
    }
    res.json(msgs)
  })
    .limit(limitPerPage)
    .sort({
      created_date: 'desc'
    })
}

const create_a_msg = async data => {
  try {
    const new_msg = new Msg()
    new_msg.raw = data
    new_msg.message_id = data.message_id

    let text = _.get(data, 'text', '') || _.get(data, 'caption', '')
    if (text && text.length < 1) {
      text = _.get(data, 'caption', '')
      console.log('-------- No text found. Getting caption instead', text)
    }
    const isThisAnAd = ctlHelper.isAd(text)
    if (isThisAnAd) {
      console.log('Channel’s ad was blocked')
      return
    }
    new_msg.raw.text = ctlHelper.extractClutter(text)

    const chat = _.get(data, 'chat', {})
    new_msg.username = chat.username
    if (chat.type !== 'channel') {
      new_msg.username = chat.username
    } else {
      new_msg.username = chat.title
    }
    new_msg.chat_id = chat.id

    const tags = ctlHelper.extractHashtags(text)
    new_msg.tags = tags

    // save msg first
    const url = ctlHelper.extractUrl(text)
    new_msg.preview.url = url
    console.log('-------- parsed urls', url)
    new_msg.save((e, msg) => {
      if (e) {
        console.error('ERR: SAVE ERROR')
        throw e
      }
    })

    // crawl previews
    if (url) {
      let udemyContents = 'No udemy course found'
      if (url.indexOf('udemy.com') !== -1) {
        udemyContents = await ctlHelper.prepareUdemyCourseJSON(url)

        // const udemyContent = JSON.parse(JSON.stringify(udemyContents))

        if (udemyContents) {
          new_msg.preview.mark = {}
          new_msg.preview.courseId = udemyContents.id
          new_msg.preview.courseUrl = udemyContents.url
          new_msg.preview.mark.text = udemyContents.description
          new_msg.preview.mark.author = udemyContents.authors
          new_msg.preview.mark.date = udemyContents.date
          new_msg.preview.mark.title = udemyContents.title
          new_msg.preview.mark.description = udemyContents.curriculum
          new_msg.preview.mark.keywords = udemyContents.topics.join(', ')
          new_msg.preview.mark.url = udemyContents.image
        } else {
          console.log('-------- Error populating course contents')
        }
      }

      // const mark = await ctlHelper.preparePreviewMark(url)

      // try {
      //   new_msg.preview.mark = JSON.parse(JSON.stringify(mark))
      // } catch (e) {
      //   console.error('-------- create_a_msg: MARK_ERROR:', new_msg)
      // }

      try {
        // new_msg.preview.udemy = JSON.parse(JSON.stringify(udemyContents))
        console.log('-------- What’s inside udemyContents?', udemyContents)
      } catch (e) {
        console.error('-------- create_a_msg: ERROR:', new_msg)
      }

      // update msg
      new_msg.save((e, post) => {
        if (e) {
          console.error('-------- ERR: SAVE ERROR')
          throw e
        }
      })
    }
  } catch (e) {
    throw e
  }
}

const update_a_msg = ({ edited_channel_post: data }) => {
  try {
    Msg.findOne({ message_id: data.message_id }, async (err, old_msg) => {
      console.log('----- FOUND', old_msg)
      if (old_msg) {
        const chat = _.get(data, 'chat', {})
        let text = _.get(data, 'text', '') || _.get(data, 'caption', '')
        if (text && text.length < 1) {
          text = _.get(data, 'caption', '')
        }

        old_msg.tags = ctlHelper.extractHashtags(text)
        old_msg.raw = data
        if (chat.type !== 'channel') {
          old_msg.username = chat.username
        }
        old_msg.chat_id = chat.id

        // previews
        const url = ctlHelper.extractUrl(text)
        old_msg.preview.url = url
        if (url) {
          const mercury = await ctlHelper.preparePreviewMercury(url)
          const mark = await ctlHelper.preparePreviewMark(url)

          try {
            old_msg.preview.mark = JSON.parse(JSON.stringify(mark))
          } catch (e) {
            console.error('-------- MARK_ERROR:', old_msg)
          }

          try {
            old_msg.preview.mark = JSON.parse(JSON.stringify(mark))
          } catch (e) {
            console.error('-------- MERCURY_ERROR:', old_msg)
          }
        }

        old_msg.save((e, old_msg) => {
          if (e) {
            throw e
          }
        })
      }
    })
  } catch (e) {
    console.error('ERR: UPDATE_MSG_ERR')
    throw e
  }
}

exports.list_all_msgs = list_all_msgs
exports.create_a_msg = create_a_msg
exports.update_a_msg = update_a_msg
