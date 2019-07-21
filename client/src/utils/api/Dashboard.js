import _fetch from './_fetch'

export default {
  Msgs: {
    get () {
      return _fetch({
        method: 'GET',
        api: {
          service: 'api',
          version: 'v1'
        },
        path: `/msgs`
      })
    }
  }
}
