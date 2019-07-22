const getUrls = require('get-urls')
const cleanMark = require('clean-mark')
const nodeMercuryParser = require('node-mercury-parser')
nodeMercuryParser.init('Skeosh2Uy3TeMxKeURfJKLxqN68suE3Wy9CVm3wf')

const extraTags = text => {
  if (!text) return ['untagged']
  const extractedTags = text.match(/\[(.*?)\]/g) // ['[Design]', '[Code]', ...]
  const tags =
    extractedTags &&
    extractedTags.map(t => t.replace(/[\[ | \]]/g, '').toLowerCase()) // ['design', 'code', ...]
  return tags.length > 0 ? tags : ['untagged']
}

const extractClutter = text => {
  return text.replace(/\\n\\n@multifeed_edge_bot/g, '')
}

const extractHashtags = text => {
  if (!text) return ['untagged']
  const extractedTags = text.match(/\#(.*?)\ /g) // ['#tag ', '#foo ']
  const tags = extractedTags && extractedTags.map(t => t.replace(/[# ]/g, ''))
  if (tags) return tags.length > 0 ? tags : ['untagged']
  return ['untagged']
}

const extractUrl = text => {
  const urlSet = getUrls(text)
  const urlArr = Array.from(urlSet)

  return !!urlArr[0] ? urlArr[0] : ''
}

const preparePreviewMercury = url => {
  return nodeMercuryParser.get(url)
}

const preparePreviewMark = async url => {
  return cleanMark(url, {})
}

const isAd = text => {
  if (text.match(/@RegularPromos/gi)) {
    return true
  }
  return false
}

exports.extraTags = extraTags
exports.extractHashtags = extractHashtags
exports.extractClutter = extractClutter
exports.extractUrl = extractUrl
exports.preparePreviewMercury = preparePreviewMercury
exports.preparePreviewMark = preparePreviewMark
exports.isAd = isAd
