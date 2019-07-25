const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MsgSchema = new Schema({
  raw: Schema.Types.Mixed,
  message_id: Number,
  username: String,
  chat_id: Number,
  tags: [String],
  preview: {
    url: String,
    mark: Schema.Types.Mixed,
    // mercury: Schema.Types.Mixed,
    courseId: Number,
    courseUrl: String
  },
  created_date: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Msg', MsgSchema)
