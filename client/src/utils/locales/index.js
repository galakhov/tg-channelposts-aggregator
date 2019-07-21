import _isNil from 'lodash/isNil'

import { getLanguage } from '~/utils'
import _get from 'lodash/get'
import cn from './zh-cn.json'
import hk from './zh-hk.json'
import en from './en.json'

const dictionaryMap = {
  'zh-cn': cn,
  'zh-hk': hk,
  'en': en
}

const locale = getLanguage()

const t = (key, ...args) => {
  args = args || []
  let value = _get(dictionaryMap[locale], key, key)
  if (args.length) {
    args.forEach(arg => {
      value = value.replace('%s', arg)
    })
  }
  return value
}

export const siteTitle = (extra) => {
  extra = _isNil(extra) ? '' : ` - ${extra}`
  return `${t('title')}${extra}`
}

export default t
