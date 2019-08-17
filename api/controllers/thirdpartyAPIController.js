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
          url[1].indexOf('https://www.udemy.com/') !== -1 ||
          url[1].indexOf('https://udemy.com/') !== -1
        ) {
          const isLinkAlreadyInDB = ctlHelper.isAlreadyInDB(url[1])
          if (
            // If the course link isn't in DB, continue...
            typeof isLinkAlreadyInDB !== 'undefined' &&
            isLinkAlreadyInDB === false
          ) {
            queue.push(() => {
              return new Promise(resolve => {
                setTimeout(() => {
                  ctlHelper.parseAndSaveCourse(url[1], url[0])
                  resolve()
                }, 5000)
              })
                .then(r => {
                  console.log(
                    ctlHelper.getFullDate() +
                      ' Following course added to the queue for parsing:\n' +
                      url +
                      '\n\n'
                  )
                })
                .catch(e => {
                  console.log('Error: ', e)
                })
            })
            queue.wait().then(() => {
              // the last step in every queue is to cancel the running cron job
              if (this.jobs.running) {
                this.jobs.stop()
                this.automate()
              }
            })
          }
        }
      })
    }
  }

  execute() {
    const getCouponsNumber = async (graphqlQuery = this.config.query) => {
      const variables = {
        myDate: new Date().toISOString().split('T')[0]
      }
      const freeCoursesIds = [],
        freeCouponsIds = []
      // see docs at: https://github.com/prisma/graphql-request
      request('https://comidoc.net/api', graphqlQuery, variables)
        .then(data => {
          if (data && data.free) {
            JSON.parse(JSON.stringify(data.free)).forEach(course => {
              const urlWithoutParameters = course.cleanUrl
              const courseId = course.udemyId
              ctlHelper
                .isAlreadyInDB(urlWithoutParameters)
                .then(result => {
                  if (
                    // If the course's link isn't already in DB, continue...
                    typeof result !== 'undefined' &&
                    result !== true
                  ) {
                    const courseUrl = `https://www.udemy.com${urlWithoutParameters}`
                    freeCoursesIds.push([courseId, courseUrl])
                  }
                })
                .catch(err => {
                  console.log('data.free response errors: ', err)
                })
            })
            setTimeout(() => {
              console.log(
                '\nThirdPartyCourses -> freeCourses\n',
                freeCoursesIds.join('\n') + '\n\n'
              )
              // prepare & save the post
              this.addToQueue(freeCoursesIds)
            }, 10000)
          }

          if (data && data.coupons) {
            JSON.parse(JSON.stringify(data.coupons)).forEach(obj => {
              const urlWithoutParameters = obj.course.cleanUrl
              const courseId = obj.course.udemyId
              ctlHelper
                .isAlreadyInDB(urlWithoutParameters)
                .then(result => {
                  if (
                    // If the course link isn't in DB, continue...
                    typeof result !== 'undefined' &&
                    result !== true
                  ) {
                    const freeCoupon = `https://www.udemy.com${urlWithoutParameters}?couponCode=${
                      obj.course.coupon[0].code
                    }`
                    freeCouponsIds.push([courseId, freeCoupon])
                  }
                })
                .catch(err => {
                  console.log('data.coupons response errors: ', err)
                })
            })
            setTimeout(() => {
              console.log(
                '\nThirdPartyCourses -> freeCoupons\n',
                freeCouponsIds.join('\n') + '\n\n'
              )
              // prepare & save the post
              this.addToQueue(freeCouponsIds)
            }, 15000)
          }
        })
        .catch(err => {
          console.log('GraphQL response errors: ', err)
        })
    }

    getCouponsNumber()
  }

  automate() {
    // https://www.npmjs.com/package/cron
    // https://github.com/kelektiv/node-cron
    const { CronJob } = require('cron')
    const max = 45,
      min = 15
    const randomTime = Math.floor(Math.random() * (max - min)) + min
    this.jobs = new CronJob(
      `*/${randomTime} * * * *`, // every 30th minute
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
    this.jobs.nextDates(5).forEach(d => {
      const date = JSON.stringify(d)
        .replace(/-/g, '/')
        .replace(/T/, ' ')
        .replace(/Z/, '+00:00')
      const newDate = new Date(date)
      const utcDate = Date.UTC(
        newDate.getUTCFullYear(),
        newDate.getUTCMonth(),
        newDate.getUTCDate(),
        newDate.getUTCHours(),
        newDate.getUTCMinutes(),
        newDate.getUTCSeconds()
      )
      const nextDate = ctlHelper.getFullDate(new Date(utcDate))
      console.log(`-------- ${nextDate}`)
    })
    console.log('-------- etc.\n\n')
  }
}

module.exports = ThirdPartyCourses
