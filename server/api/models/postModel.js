const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PostSchema = new Schema({
  // raw: Schema.Types.Mixed,
  // message_id: Number,
  // username: String,
  // chat_id: Number,
  // tags: [String],
  preview: {
    url: String,
    courseContents: Schema.Types.Mixed,
    courseId: Number,
    courseUrl: String
  },
  created_date: {
    type: Date,
    default: Date.now
  }
})
// PostSchema.index({ preview.courseId: -1, created_date: -1 })
module.exports = mongoose.model('Post', PostSchema)
