import _merge from 'lodash/merge'
import _isObject from 'lodash/isObject'
import _isArray from 'lodash/isArray'
import _isEmtpy from 'lodash/isEmpty'
// import qs from 'querystring'

import { API_HOST } from '~/utils/constants'

const checkStatus = res => {
  if (res.status >= 200 && res.status < 300) {
    return res
  } else {
    console.log('Checking status:\n', checkStatus)
    throw res
  }
}

const parseResponse = res => {
  return res.text().then(text => {
    // console.log('Getting response from the API:\n', text)
    const headers = res.headers
    let data = null
    try {
      data = JSON.parse(text)
    } catch (e) {
      data = text || null
    }
    return { headers, data }
  })
}

export default ({ api, method, path, query, body }) => {
  // const queries = _isEmtpy(query) ? '' : `?${qs.encode(query)}`
  const cleanQuery = query ? `?${query.replace(/[^&=-\w\d]/gi, '')}` : ''
  const queries = _isEmtpy(query) ? '' : `${cleanQuery}`
  const _url = `${API_HOST}/${api.service}/${api.version}${path}${queries}`

  const API_HEADERS = {} // placeholder

  const _opts = {
    method,
    headers: Object.assign({}, API_HEADERS)
  }

  if (body) {
    const isJSON = _isObject(body) || _isArray(body)

    _merge(_opts, {
      headers: isJSON
        ? {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        }
        : {},
      body: isJSON ? JSON.stringify(body) : body
    })
  }

  // console.log('queries raw: \n' + query)
  // console.log('queries encoded: \n' + queries)
  // console.log('Accessing the API:\n', _url)
  // console.log(_opts)

  return fetch(_url, _opts)
    .then(checkStatus)
    .then(parseResponse)
    .catch(err => {
      console.log('1: Fetching of data from DB failed:\n', err)
      throw err
    })
}
