const ElasticSearchQuery = term => {
  return {
    multi_match: {
      query: term,
      fuzziness: 'AUTO',
      fields: [
        'preview.courseContents.title',
        'preview.courseContents.headline',
        'preview.courseContents.keywords',
        'preview.courseContents.text'
      ]
    }
  }
}

export default ElasticSearchQuery
