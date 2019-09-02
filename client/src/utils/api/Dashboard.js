import _fetch from './_fetch'

// Entrypoint: ./api/v1/posts

export default {
  Posts: {
    get (skip = -1, limit = 50) {
      return _fetch({
        method: 'GET',
        api: {
          service: 'api',
          version: 'v1'
        },
        path: `/posts`,
        query: `offset=${skip}&limit=${limit}`
      })
    },
    count () {
      return _fetch({
        method: 'GET',
        api: {
          service: 'api',
          version: 'v1'
        },
        path: `/posts/count`
      })
    }
  }
}
