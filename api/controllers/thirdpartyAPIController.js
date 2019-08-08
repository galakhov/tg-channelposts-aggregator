// const fetch = require('node-fetch')
const { request } = require('graphql-request')
const ctlHelper = require('./helper')
const { SequentialTaskQueue } = require('sequential-task-queue')

class ThirdPartyCourses {
  constructor(config) {
    this.config = config || {
      jobs: null,
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
    if (urlsArray && urlsArray.length > 0) {
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
                  'Course added to the queue to be parsed and saved: ' + url
                )
              })
              .catch(e => {
                console.log('Error: ', e)
              })
          })
          queue.wait().then(() => {
            // the last step in every queue is to cancel the running cron job
            // if (this.jobs.running) {
            //   this.jobs.stop()
            // }
          })
        }
      })
    }
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
            JSON.parse(JSON.stringify(data.free)).forEach(course => {
              const urlWithoutParameters = course.cleanUrl
              ctlHelper
                .isAlreadyInDB(urlWithoutParameters)
                .then(result => {
                  if (
                    // If the course link isn't already in DB, continue...
                    typeof result !== 'undefined' &&
                    !result
                  ) {
                    const courseUrl = `https://udemy.com${urlWithoutParameters}`
                    freeCourses.push(courseUrl)
                    // if (this.jobs.running) {
                    //   this.jobs.stop()
                    // }
                  }
                })
                .catch(err => {
                  console.log('data.free response errors: ', err)
                })
            })
            setTimeout(() => {
              console.log('ThirdPartyCourses -> freeCourses', freeCourses)
              // prepare & save the post
              this.addToQueue(freeCourses)
            }, 10000)
          }

          if (data && data.coupons) {
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
                    freeCoupons.push(freeCoupon)
                    // if (this.jobs.running) {
                    //   this.jobs.stop()
                    // }
                  }
                })
                .catch(err => {
                  console.log('data.coupons response errors: ', err)
                })
            })
            setTimeout(() => {
              console.log('ThirdPartyCourses -> freeCoupons', freeCoupons)
              // prepare & save the post
              this.addToQueue(freeCoupons)
            }, 15000)
          }
        })
        .catch(err => {
          console.log('GraphQL response errors: ', err)
        })
    }

    const coupons = getCouponsNumber()
    console.log('COUPONS CHECKER EXECUTED: ', coupons)
  }

  automate() {
    // https://www.npmjs.com/package/cron
    // https://github.com/kelektiv/node-cron
    const { CronJob } = require('cron')
    this.jobs = new CronJob(
      '*/30 * * * *', // every 30 minutes
      () => {
        this.execute()
        // this.jobs.stop()
      },
      null,
      false, // autostart?
      'Europe/Amsterdam'
    )
    this.jobs.start()
    console.log(
      '\n-------- Planning automation: cron will run on the following dates:\n'
    )
    this.jobs.nextDates(10).forEach(d => {
      const date = JSON.stringify(d)
        .replace(/T/, ' ')
        .replace(/\.000Z/, ' UTC+2')
      // console.log('TCL: automate -> date', date)
      console.log('--------', ctlHelper.getFullDate(new Date(date)) + '\n')
    })
    console.log('-------- etc.\n\n')
  }
}

module.exports = ThirdPartyCourses
