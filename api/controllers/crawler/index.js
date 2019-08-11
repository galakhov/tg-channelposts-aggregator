'use strict'

function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex
}

const cheerio = _interopDefault(require('cheerio'))
const request = _interopDefault(require('sync-request'))
const normalizeUrl = _interopDefault(require('normalize-url'))
const url = require('url')

class UdemyCrawler {
  constructor(config, courseId = null) {
    this.config = config || {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'max-age=0'
      }
    }
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
      return _cb(new Error('Must point to udemy.com/course-path'))
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

    const resLandingPage = request('GET', requestUrl, {
      headers: {
        'User-Agent': this.config.headers['User-Agent']
      }
    })

    if (resLandingPage.statusCode !== 200) {
      console.log(
        '======== UdemyCrawler -> execute -> resLandingPage',
        resLandingPage
      )
      return _cb(
        new Error(
          'Udemy page responded with status ' + resLandingPage.statusCode
        )
      )
    }

    const $ = cheerio.load(resLandingPage.getBody())

    // id, title, headline, image
    Course.id = this.courseId || $('body#udemy').attr('data-clp-course-id')
    console.log('======== UdemyCrawler -> execute -> Course.id', Course.id)
    Course.title = $('.clp-lead__title[data-purpose="lead-title"]')
      .text()
      .trim()
    Course.headline = $('.clp-lead__headline[data-purpose="lead-headline"]')
      .text()
      .trim()
    const crawledRating = $('.rate-count .tooltip-container span:first-child')
      .text()
      .trim()
    Course.rating =
      crawledRating.length > 3
        ? crawledRating.trim().substr(0, 3)
        : crawledRating
    const enrollmentNr = $('[data-purpose="enrollment"]')
      .text()
      .trim()
    const startEnrolledText = enrollmentNr.indexOf(' students enrolled')
    Course.enrollmentNumber = enrollmentNr
      .substring(0, startEnrolledText + 18) // remove first part of this weird string
      .replace(/(?:\\n\\n)/gm, '') // also remove double line breaks: \n\n
      .replace(' students enrolled', '') // remove the second part of the str

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
    let resApi = request('GET', apiUrl, {
      headers: {
        'User-Agent': this.config.headers['User-Agent'],
        'Content-Type': 'application/json'
      }
    })

    if (resApi.statusCode !== 200) {
      return _cb(
        new Error('Udemy API page responded with status ' + resApi.statusCode)
      )
    }

    let jsonData = JSON.parse(resApi.getBody())

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

    // price, discount
    Course.price = jsonData.purchase.data.pricing_result.price.amount
    Course.fullPrice = jsonData.purchase.data.list_price.amount

    Course.authors =
      jsonData.instructor_bio.data.instructors_info[0].display_name

    // Course.image = jsonData.introduction_asset.images.image_480x270

    if (jsonData.purchase.data.pricing_result.has_discount_saving) {
      Course.discount =
        jsonData.purchase.data.pricing_result.discount_percent_for_display
      Course.discountExpiration = jsonData.purchase.data.pricing_result.campaign
        ? jsonData.purchase.data.pricing_result.campaign.end_time
        : null
    }

    return _cb(null, Course)
  }
}

module.exports = UdemyCrawler
