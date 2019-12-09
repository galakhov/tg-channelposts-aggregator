module.exports = function(doc, ns, updateDesc) {
  // the doc namespace e.g. test.test is passed as the 2nd arg
  // if available, an object containing the update description is passed as the 3rd arg
  // flatten some of the nested objects
  doc.courseData = doc.preview.courseContents
  // also omit tags
  doc = _.omit(doc, 'raw')
  doc = _.omit(doc, 'tags')
  doc = _.omit(doc, 'courseContents')
  return doc
}
/*
    [[mapping]]
    namespace = "telegramchanneldb.posts"
    index = "preview"
    type = "nested"

    [[mapping]]
    namespace = "telegramchanneldb.posts"
    index = "preview.courseContents"
    type = "nested"

    [[mapping]]
    namespace = "telegramchanneldb.posts"
    index = "preview.courseContents.lectures"
    type = "nested"

    [[mapping]]
    namespace = "telegramchanneldb.posts"
    index = "preview.courseContents.lectures.contents"
    type = "nested"

    [[mapping]]
    namespace = "telegramchanneldb.posts"
    index = "preview.courseContents.description"
    type = "nested"

    [[mapping]]
    namespace = "telegramchanneldb.posts"
    index = "preview.courseContents.description.contents"
    type = "nested"
*/
