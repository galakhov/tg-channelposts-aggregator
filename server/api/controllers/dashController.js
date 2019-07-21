const _ = require('lodash')
const ctlHelper = require('./helper')

const mongoose = require('mongoose'),
  Msg = mongoose.model('Msg')

const list_all_msgs = (req, res) => {
  Msg.find({}, (err, msgs) => {
    if (err) {
      res.send(err)
    }
    res.json(msgs)
  })
}

const create_a_msg = async (data) => {
  try {
    const new_msg = new Msg()
    new_msg.raw = data
    new_msg.message_id = data.message_id

    const chat = _.get(data, 'chat', {})
    new_msg.username = chat.username
    new_msg.chat_id = chat.id

    const text = _.get(data, 'text', '')
    const tags = ctlHelper.extractHashtags(text)
    new_msg.tags = tags

    // save msg first
    const url = ctlHelper.extraUrl(text)
    new_msg.preview.url = url
    new_msg.save((e, msg) => {
      if (e) {
        console.error('ERR: SAVE ERROR')
        throw(e)
      }
    })

    // crawl previews
    if (url) {
      const mercury = await ctlHelper.preparePreviewMercury(url)
      const mark = await ctlHelper.preparePreviewMark(url)

      try {
        new_msg.preview.mark = JSON.parse(JSON.stringify(mark))
      } catch (e) {
        console.error('MARK_ERROR:', new_msg)
      }

      try {
        new_msg.preview.mark = JSON.parse(JSON.stringify(mark))
      } catch (e) {
        console.error('MERCURY_ERROR:', new_msg)
      }

      // update msg
      new_msg.save((e, msg) => {
        if (e) {
          console.error('ERR: SAVE ERROR')
          throw(e)
        }
      })
    }
  } catch (e) {
    throw(e)
  }
}

const update_a_msg = ({ edited_channel_post: data }) => {
  try {
    Msg.findOne({ message_id: data.message_id }, async (err, old_msg) => {
      console.log('----- FOUND', old_msg)
      if (old_msg) {
        const chat = _.get(data, 'chat', {})
        const text = _.get(data, 'text', '')

        old_msg.tags = ctlHelper.extractHashtags(text)
        old_msg.raw = data
        old_msg.username = chat.username
        old_msg.chat_id = chat.id

        // previews
        const url = ctlHelper.extraUrl(text)
        old_msg.preview.url = url
        if (url) {
          const mercury = await ctlHelper.preparePreviewMercury(url)
          const mark = await ctlHelper.preparePreviewMark(url)

          try {
            old_msg.preview.mark = JSON.parse(JSON.stringify(mark))
          } catch (e) {
            console.error('MARK_ERROR:', old_msg)
          }

          try {
            old_msg.preview.mark = JSON.parse(JSON.stringify(mark))
          } catch (e) {
            console.error('MERCURY_ERROR:', old_msg)
          }
        }

        old_msg.save((e, old_msg) => {
          if (e) {
            throw(e)
          }
        })
      }
    })
  } catch (e) {
    console.error('ERR: UPDATE_MSG_ERR')
    throw(e)
  }
}

exports.list_all_msgs = list_all_msgs
exports.create_a_msg = create_a_msg
exports.update_a_msg = update_a_msg
