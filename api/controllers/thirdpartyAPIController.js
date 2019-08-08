// const fetch = require('node-fetch')
const { request } = require('graphql-request')
const ctlHelper = require('./helper')
const { SequentialTaskQueue } = require('sequential-task-queue')

class ThirdPartyCourses {
  constructor(config) {
    this.config = config || {
      // Get Daily courses (coupons & free)
      query: `query getDailyCourses($myDate: DateTime) {
            free: courses(
                where: { isFree: true, createdAt_gte: $myDate }
                orderBy: createdAt_DESC
            ) {
                udemyId
                cleanUrl
                createdAt
            }
            coupons: coupons(
                where: {
                    isValid: true
                    createdAt_gte: $myDate
                    discountValue_starts_with: "100%"
                }
                orderBy: createdAt_DESC
            ) {
                course {
                        udemyId
                        cleanUrl
                        createdAt
                        updatedAt
                        coupon(
                            where: { isValid: true, createdAt_gte: $myDate }
                            orderBy: createdAt_DESC
                        ) {
                            code
                            discountValue
                            createdAt
                        }
                    }
            }
        }`
    }
  }

  addToQueue(urlsArray) {
    // https://github.com/BalassaMarton/sequential-task-queue#readme
    const queue = new SequentialTaskQueue()
    urlsArray.forEach(url => {
      if (
        url.indexOf('https://www.udemy.com/') !== -1 ||
        url.indexOf('https://udemy.com/') !== -1
      ) {
        queue.push(() => {
          return new Promise(resolve => {
            setTimeout(() => {
              ctlHelper.parseAndSaveCourse(url)
              resolve()
            }, 5000)
          })
            .then(r => {
              console.log(
                'Course added to queue to be parsed and saved: ' + url
              )
            })
            .catch(e => {
              console.log('Error: ', e)
            })
        })
      }
    })
  }

  execute() {
    const getCouponsNumber = async (graphqlQuery = this.config.query) => {
      const variables = {
        myDate: new Date().toISOString().split('T')[0]
      }
      const freeCourses = [],
        freeCoupons = []
      // see docs at: https://github.com/prisma/graphql-request
      request('https://comidoc.net/api', graphqlQuery, variables)
        .then(data => {
          if (data && data.free) {
            // console.log(JSON.stringify(data.free, undefined, 4))

            JSON.parse(JSON.stringify(data.free)).forEach(course => {
              const urlWithoutParameters = course.cleanUrl
              console.log(
                'ThirdPartyCourses -> urlWithoutParameters',
                urlWithoutParameters
              )
              ctlHelper
                .isAlreadyInDB(urlWithoutParameters)
                .then(result => {
                  if (
                    // If the course link isn't in DB, continue...
                    typeof result !== 'undefined' &&
                    !result
                  ) {
                    const courseUrl = `https://udemy.com${urlWithoutParameters}`
                    // console.log(
                    //   'This free course can be added to DB: ',
                    //   courseUrl
                    // )
                    // console.log('freeCourse', courseUrl)
                    freeCourses.push(courseUrl)
                  }
                })
                .catch(err => {
                  console.log('data.free response errors: ', err)
                })
            })
            setTimeout(() => {
              console.log('ThirdPartyCourses -> freeCourses', freeCourses)
              this.addToQueue(freeCourses)
            }, 10000)
          }
          if (data && data.coupons) {
            // console.log(
            //   'data.coupons',
            //   JSON.stringify(data.coupons, undefined, 4)
            // )
            JSON.parse(JSON.stringify(data.coupons)).forEach(obj => {
              const urlWithoutParameters = obj.course.cleanUrl
              ctlHelper
                .isAlreadyInDB(urlWithoutParameters)
                .then(result => {
                  if (
                    // If the course link isn't in DB, continue...
                    typeof result !== 'undefined' &&
                    !result
                  ) {
                    const freeCoupon = `https://udemy.com${urlWithoutParameters}?couponCode=${
                      obj.course.coupon[0].code
                    }`
                    // console.log(
                    //   'This course coupon can be added to DB: ' + freeCoupon
                    // ).then(res => {
                    // console.log('freeCoupon', freeCoupon)
                    freeCoupons.push(freeCoupon)

                    // prepare & save the post
                  }
                })
                .catch(err => {
                  console.log('data.coupons response errors: ', err)
                })
            })
            setTimeout(() => {
              console.log('ThirdPartyCourses -> freeCoupons', freeCoupons)
              this.addToQueue(freeCoupons)
            }, 10000)
          }
        })
        .then(res => {
          // prepare & save the post
          // ctlHelper.parseAndSaveCourse(url)
        })
        .catch(err => {
          console.log('GraphQL response errors: ', err)
        })

      /*
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
            }
        */
    }

    const coupons = getCouponsNumber()
    console.log('COUPONS CHECKER EXECUTED: ', coupons)
  }

  automate() {
    // https://www.npmjs.com/package/cron
    const { CronJob } = require('cron')
    new CronJob(
      '* 35 * * * *',
      () => {
        this.execute()
      },
      null,
      true, // autostart?
      'Europe/Amsterdam'
    )
  }
}

module.exports = ThirdPartyCourses
