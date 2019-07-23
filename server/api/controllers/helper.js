const getUrls = require('get-urls')
const cleanMark = require('clean-mark')
const Mercury = require('@postlight/mercury-parser')
// const nodeMercuryParser = require('node-mercury-parser')
// nodeMercuryParser.init(process.env.MERCURY_PARSER_KEY)

const extractTags = text => {
  if (!text) return ['untagged']
  const extractedTags = text.match(/\[(.*?)\]/g) // ['[Design]', '[Code]', ...]
  const tags =
    extractedTags &&
    extractedTags.map(t => t.replace(/[\[ | \]]/g, '').toLowerCase()) // ['design', 'code', ...]
  return tags.length > 0 ? tags : ['untagged']
}

const extractClutter = text => {
  const filteredString = text.replace(/@multifeed_edge_bot/g, '')
  return filteredString
}

const extractHashtags = text => {
  if (!text) return ['untagged']
  const extractedTags = text.match(/\#(.*?)\ /g) // ['#tag ', '#foo ']
  const tags = extractedTags && extractedTags.map(t => t.replace(/[# ]/g, ''))
  if (tags) return tags.length > 0 ? tags : ['untagged']
  return ['untagged']
}

const extractUrl = text => {
  // https://github.com/sindresorhus/normalize-url#options
  const urlSet = getUrls(text, { stripWWW: false })
  const urlArr = Array.from(urlSet)
  let offset = 4
  if (urlArr[0]) {
    let rightPartOfUrlPosition = urlArr[0].search(/.com/gm)
    console.log(
      '--------- rightPartOfUrlPosition COM NOT FOUND',
      rightPartOfUrlPosition
    )

    // fix urls with '.com' only
    if (rightPartOfUrlPosition !== -1) {
      // rightPartOfUrlPosition = urlArr[0].search(/.tt/gm)
      // offset -= 1
      const leftPart = urlArr[0].substr(0, rightPartOfUrlPosition + offset)
      const rightPart = urlArr[0].substr(rightPartOfUrlPosition + offset)
      return `${leftPart}${rightPart.replace(/\./g, '')}`
    }
    return urlArr[0]
  }
  return ''
}

const preparePreviewMercury = url => {
  // return nodeMercuryParser.get(url)
  const mercuryOtions = {
    headers: {
      // Cookie: 'www.udemy.com	FALSE	/regex-academy-an-introduction-to-text-parsing-sorcery/learn/learn/undefined	FALSE	0	gsScrollPos-11045	0 www.udemy.com	FALSE	/home/my-courses/learning	FALSE	0	gsScrollPos-9363	 .udemy.com	TRUE	/	FALSE	1595169427	__cfduid	d399040430cb23bfa3988859b852e7a001563633427 www.udemy.com	FALSE	/	FALSE	1563932013	ud_cache_version	1 www.udemy.com	FALSE	/	FALSE	1595169428	ud_firstvisit	2019-07-20T14:37:07.696031+00:00:1hoqU0:iFeyEyikjOFKaaf8z2Wv4uTlcuc www.udemy.com	FALSE	/	FALSE	1563932013	ud_cache_language	en www.udemy.com	FALSE	/	FALSE	1563932013	ud_cache_marketplace_country	DE .udemy.com	TRUE	/	TRUE	1595381613	__udmy_2_v57r	0013669c28b542a48fa1db462598454a www.udemy.com	FALSE	/	FALSE	1563932013	ud_cache_device	None www.udemy.com	FALSE	/	FALSE	1563932013	ud_cache_price_country	DE www.udemy.com	FALSE	/	FALSE	0	_pxhd	6e68a079dfa4ccbcd59a7b1f5da98c061b2cbfda1e3b77ca0d2a71bbc3b995c7:d99d2ae0-aafb-11e9-9bc1-f5922b574d80 www.udemy.com	FALSE	/	FALSE	1878993431	EUCookieMessageShown	true www.udemy.com	FALSE	/	FALSE	1565447831	EUCookieMessageState	initial www.udemy.com	FALSE	/	TRUE	1566225453	client_id	bd2565cb7b0c313f5e9bae44961e8db2 www.udemy.com	FALSE	/	FALSE	1595169453	ud_credit_last_seen	None www.udemy.com	FALSE	/	FALSE	1610721453	ud_last_auth_information	&quot;{&quot;suggested_user_email&quot;: &quot;lichsys@gmail.com&quot;\054 &quot;suggested_user_avatar&quot;: &quot;https://i.udemycdn.com/user/50x50/anonymous_3.png&quot;\054 &quot;backend&quot;: &quot;udemy-auth&quot;\054 &quot;suggested_user_name&quot;: &quot;D.&quot;}:1hoqUO:nDxbNs0MSFxImwfrF2YBu3aXlXA&quot; www.udemy.com	FALSE	/	TRUE	1566225453	dj_session_id	ndqht7txdz4ufx4hrdy8nk8mvtd7bwl5 www.udemy.com	FALSE	/	TRUE	1595083053	csrftoken	pT0c8gaAH8sG28Ru5GuqtIj4qR0iuW8pOOLsZInFgvHzzc46P474ziDSaKimGPwq www.udemy.com	FALSE	/	FALSE	1563932013	ud_cache_user	17762994 www.udemy.com	FALSE	/	TRUE	1566225453	access_token	RW7j8HWLvYwiQcwbS1YJxEwwDKXKqCoBdRgvEctB www.udemy.com	FALSE	/	FALSE	1563932013	ud_cache_logged_in	1 www.udemy.com	FALSE	/	FALSE	1563932013	ud_cache_release	6a9715ffb84d65afbaca5309e07e9e137d14d7a7 www.udemy.com	FALSE	/	FALSE	1563850092	ud_credit_unseen	0 www.udemy.com	FALSE	/	FALSE	1563847413	seen	1 .udemy.com	TRUE	/	FALSE	1563847411	eventing_session_id	0b48824db5e94f4ba9b58a09e06b2c61 www.udemy.com	FALSE	/	FALSE	1564016736	_px2	eyJ1IjoiZjc0NDdkYTAtYWNlNS0xMWU5LThlNjMtNDcxMWMyZGZjMWFjIiwidiI6ImZhYTUyOWI0LWFjZTUtMTFlOS1hOWM3LTAyNDJhYzEyMDAwZSIsInQiOjE1NjM4NDQ0MzY1MzIsImgiOiI2M2M1ZGM2MzZlZDUwODEyMzQ5OGFiNjIwZTQzYmZmNzQxMmVkYTJmNWMzNTE1ZTM5ZDU0ZjVmNzA0NmUxNjEyIn0= www.udemy.com	FALSE	/	FALSE	1564016736	_px3	162fa09ae467a33b7fcf048c180bcee6ef01dbccd3eae6adbdf53bff033ee8c9:AS4hgtV2t95w8rmzVpLMH4DBT9ipbfg1tTyDLybfFxS0iNHR3MI2YMMBmckJBXUyrNyIw06D73yAGjd9w8aGdg==:1000:efzkVEsNccEnU2ETxsRNRPm8MWZcN5yEP84OEDfqoAzkYsrdQgZl4FsQ2vs7oxnmDqgPcwMrbiCMj8fFpCFp1tlhVXwqDSMiCPI0nElTs/WmV9LhqPXKWdL3MkhXfJ2/gel1CHKX4EQtI483vCxRcCzR9s9CnhY96nKP0dkGsKo= www.udemy.com	FALSE	/	FALSE	1563932013	ud_cache_brand	::DE:en_US www.udemy.com	FALSE	/	FALSE	1564433704	exaff	%7B%22start_date%22%3A%222019-07-22T20%3A55%3A03.750102Z%22%2C%22code%22%3A%22bnwWbXPyqPU-xZHmkdL3HLEnWyAtmLKTxw%22%2C%22merchant_id%22%3A39197%2C%22aff_type%22%3A%22LS%22%2C%22aff_id%22%3A40046%7D:1hpjgK:g1s9_QnRZ8mir7o1cSQMbNv03OM www.udemy.com	FALSE	/	FALSE	1566437613	evi	SlFDLExYDm4DQht1TFgObkdREXBCQAMtE0kecl5WCDEdUVg2TFgObgNDG3lMWA5uR1ERcEJAAy0TSR5xWFYIYBNBGXFeQE83EwUJe19OVzpQURF0W1dBMR1RGXBbUld2SlFdY1RTWW5HEgl7W1ZHekxfCXNcUUVuCwgJN0xYRGATBUpjVFdDfgMOVm1MDhwkQVEROkxQR38DURE6TBRXdgBfCTcPQE95B0AbPBMf www.udemy.com	FALSE	/	FALSE	1626917613	ud_rule_vars	&quot;eJx9j8sKwjAQRX-lZKstk0fzWvsH4q5QYhslWAkmUxeK_25oXYgLd8Nlzpm5T4IunT36sb-HHDAmC0C5lGZg-tgK5oQ-OToehWSt0aIVzg4xXoIntiLPjgwuYY8R3dSVpCNQHfa7jmzLOLmM_RDnlP0q7zFc_brGgJoaVM14BdQybkE3HIRWfANQXlgNp5CKYmVHh78sVFRYriyoRhowkn2zy_Xkb7PP_2HdANUKxDe8tMrh8YFK-iKvN-fEVH4=:1hpjgK:6-teCZ0e24u8veLhpf1Ux1RkGeg&quot; www.udemy.com	FALSE	/	FALSE	1563932013	ud_cache_campaign_code	&quot;&quot; www.udemy.com	FALSE	/	FALSE	2194565614	muxData	mux_viewer_id=3b96180e-cd44-4e39-83b8-69c71a9e92ac&amp;msn=0.3232767824039402&amp;sid=3720a7a9-37b9-4ce4-b3f8-0df2a541de51&amp;sst=1563844609694&amp;sex=1563847114859',
      'User-Agent':
        'Mozilla/5.0 (iPhone; CPU iPhone OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E304 Safari/602.1'
    },
    contentType: 'html'
  }
  return Mercury.parse(url, mercuryOtions)
    .then(result => {
      console.log('-------- parsing...')
      console.log(result)
      return result
    })
    .catch(err => {
      console.log('-------- parsing error...')
      console.log(err)
    })
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

exports.extractTags = extractTags
exports.extractHashtags = extractHashtags
exports.extractClutter = extractClutter
exports.extractUrl = extractUrl
exports.preparePreviewMercury = preparePreviewMercury
exports.preparePreviewMark = preparePreviewMark
exports.isAd = isAd
