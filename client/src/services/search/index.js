class SearchService {
  constructor (elasticClient) {
    this.client = elasticClient
    // this.save = this.save.bind(this)
    // this.delete = this.delete.bind(this)
    this.find = this.find.bind(this)
  }

  async find (term, start, size) {
    try {
      const response = await this.client.search({
        body: {
          query: {
            multi_match: {
              query: `${term}`,
              fuzziness: 'AUTO',
              fields: [
                'preview.courseContents.title',
                'preview.courseContents.headline',
                'preview.courseContents.keywords',
                'preview.courseContents.text'
              ]
            }
          },
          _source: [
            'created_date',
            'preview.courseId',
            'preview.courseUrl',
            'preview.courseContents.title',
            'preview.courseContents.headline',
            'preview.courseContents.keywords',
            'preview.courseContents.url',
            'preview.courseContents.text',
            'preview.courseContents.discountExpirationDate',
            'preview.courseContents.discountInPercent',
            'preview.courseContents.initialPrice',
            'preview.courseContents.currentPrice',
            'preview.courseContents.rating',
            'preview.courseContents.enrolled'
          ],
          sort: [{ _score: 'desc' }, { created_date: 'desc' }],
          from: `${start}`,
          size: `${size}`
        }
      })
      return response
    } catch (e) {
      console.log(`find error: ${e}`)
    }
  }

  //   delete(emailId) {
  //     return this.client.delete({
  //       ignore: [404],
  //       type: 'email',
  //       id: emailId,
  //       index: 'emails'
  //     })
  //   }

  //   save(email) {
  //     return this.client.create({
  //       index: 'emails',
  //       id: email.id,
  //       type: 'email',
  //       body: {
  //         userId: email.userId,
  //         recipients: email.recipients.join(','),
  //         subject: email.subject,
  //         message: email.message,
  //         from: email.from,
  //         timestamp: email.timestamp
  //       }
  //     })
  //   }
}

export default SearchService
