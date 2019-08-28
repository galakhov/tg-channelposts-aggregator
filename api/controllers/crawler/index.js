'use strict'

function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex
}

// const phantom = require('phantom')
const cheerio = _interopDefault(require('cheerio'))
const request = require('then-request')
// const request = _interopDefault(require('sync-request'))
const normalizeUrl = _interopDefault(require('normalize-url'))
const url = require('url')
const UserAgent = require('user-agents')

class UdemyCrawler {
  constructor(config, courseId = null) {
    this.config = config || {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36'
        // Accept:
        //   'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        // 'Accept-Encoding': 'gzip, deflate, br',
        // 'Accept-Language': 'en-US,en;q=0.9',
        // 'Cache-Control': 'max-age=0'
      }
    }
    this.courseId = courseId
  }

  _getApiUrl(id, components = []) {
    return (
      'https://www.udemy.com/api-2.0/course-landing-components/' +
      id +
      '/me/?components=' +
      components.join(',')
    )
  }

  execute(url$$1, cb) {
    let _cb = cb || (() => {})

    if (!url$$1) {
      return _cb(new Error('"url" parameter not defined!'))
    }

    const objUrl = new url.URL(normalizeUrl(url$$1))

    if (
      objUrl.hostname !== 'udemy.com' &&
      objUrl.hostname !== 'www.udemy.com'
    ) {
      return _cb(new Error('Invalid udemy.com course url'))
    }

    if (objUrl.pathname == null || objUrl.pathname === '/') {
      return _cb(new Error('Must point to udemy.com/course-url'))
    }

    let requestUrl = 'https://www.udemy.com' + objUrl.pathname

    if (objUrl.search) {
      requestUrl += objUrl.search
    } else {
      if (!requestUrl.endsWith('/')) {
        requestUrl += '/'
      }
    }

    const Course = {
      url: requestUrl
    }

    // coupon code
    Course.couponCode =
      objUrl.searchParams.get('couponCode') ||
      objUrl.searchParams.get('deal_code') ||
      ''

    const userAgent = new UserAgent()
    console.log('-------- userAgent:\n' + userAgent.toString())
    const newUserAgent = userAgent.toString()
    const headers = {
      'User-Agent': newUserAgent,
      // url: requestUrl,
      'set-cookie': [
        '__cfduid=d6fa31f10f333852762ac4bb4836825381565944230; expires=Sat, 30-Sep-2019 23:59:59 GMT; path=/; domain=.udemy.com; HttpOnly',
        '_pxhd=32c182d85232d65b2288fb48868e813a2182aaf7fa2caee59c4b16bf61105878:1b7e3621-c000-11e9-b968-3908e2c0de98; path=/;'
      ],
      'x-content-type-options': 'nosniff'
      // httpsAgent: new https.Agent({ keepAlive: true })
    }

    request('GET', requestUrl, {
      headers: headers,
      allowRedirectHeaders: 'https://www.udemy.com/*',
      maxRedirects: 3,
      retry: true,
      maxRetries: 3,
      retryDelay: 3000
    }).done(res => {
      if (res.statusCode !== 200) {
        return _cb(
          new Error('Udemy page responded with status ' + res.statusCode)
        )
      }
      const $ = cheerio.load(res.getBody('utf8'))
      // response.getBody())
      // id, title, headline, image
      Course.id = this.courseId || $('body').attr('data-clp-course-id')
      Course.title = $('.clp-lead__title[data-purpose="lead-title"]')
        .text()
        .trim()
      Course.headline = $('.clp-lead__headline[data-purpose="lead-headline"]')
        .text()
        .trim()
      Course.language = $('.clp-lead .clp-lead__locale')
        .text()
        .replace(/(\n)/g, '')
        .trim()
      const metaJson = JSON.parse($('#schema_markup script').html())
      Course.image = metaJson[0].image
      Course.date = $(
        '.main-content .container [data-purpose="last-update-date"] span'
      )
        .text()
        .trim()
      /*
            Also consider other opened Udemy entry points:
            https://www.udemy.com/robots.txt
            Allow:/api-2.0/course-landing-components
            Allow:/api-2.0/course-categories
            Allow:/api-2.0/course-subcategories
            Allow:/api-2.0/courses/
            Allow:/api-2.0/discovery-units
            Allow:/api-2.0/recommended-courses
            Allow:/api-2.0/structured-data
            Allow:/api-2.0/tags
            
            Udemy query API:
            https://www.udemy.com/api-2.0/course-landing-components/course_id/me/?components=
            
            topic_menu,description,purchase,redeem_coupon,introduction_asset,

            curriculum,frequently_bought_together,practice_test_bundle,instructor_bio
        */
      let apiUrl =
        this._getApiUrl(Course.id, [
          'topic_menu',
          'description',
          'purchase',
          'redeem_coupon',
          'introduction_asset',
          'curriculum',
          'instructor_bio'
        ]) +
        '&couponCode=' +
        Course.couponCode

      request('GET', apiUrl, {
        headers: {
          'User-Agent': newUserAgent,
          'Content-Type': 'application/json'
        }
      })
        .getBody('utf8')
        .then(JSON.parse)
        .done(res => {
          if (!res || res.description.length <= 0) {
            return _cb(new Error('Udemy API page responded with error ' + res))
          } else {
            console.log('UdemyCrawler -> execute -> populating contents... ✅')
          }

          let jsonData = res

          // description, audiences, topics
          Course.description = jsonData.description.data.description
          Course.audiences = jsonData.description.data.target_audiences
          Course.curriculum = {}
          Course.curriculum.contents = JSON.parse(
            JSON.stringify(jsonData.curriculum.data.sections)
          )
          Course.curriculum.courseLength =
            jsonData.curriculum.data.estimated_content_length_text
          Course.topics = jsonData.topic_menu.menu_data.map(
            m => m.title || m.display_name
          )

          Course.rating = parseFloat(
            jsonData.instructor_bio.data.instructors_info[0].avg_rating_recent
          ).toFixed(2)
          Course.enrollmentNumber =
            jsonData.instructor_bio.data.instructors_info[0].total_num_students

          // price, discount
          Course.price = jsonData.purchase.data.pricing_result.price.amount
          Course.fullPrice = jsonData.purchase.data.list_price.amount

          Course.authors =
            jsonData.instructor_bio.data.instructors_info[0].display_name

          // Course.image = jsonData.introduction_asset.images.image_480x270

          if (jsonData.purchase.data.pricing_result.has_discount_saving) {
            Course.discount =
              jsonData.purchase.data.pricing_result.discount_percent_for_display
            Course.discountExpiration = jsonData.purchase.data.pricing_result
              .campaign
              ? jsonData.purchase.data.pricing_result.campaign.end_time
              : null
          }
          return _cb(null, Course)
        })
    })
  }
}

module.exports = UdemyCrawler
