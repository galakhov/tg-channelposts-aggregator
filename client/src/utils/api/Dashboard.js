import _fetch from './_fetch'

// Entrypoint: ./api/v1/posts

export default {
  Posts: {
    get () {
      return _fetch({
        method: 'GET',
        api: {
          service: 'api',
          version: 'v1'
        },
        path: `/posts`
      })
    }
  }
}
