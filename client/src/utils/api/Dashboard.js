import _fetch from './_fetch'

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
