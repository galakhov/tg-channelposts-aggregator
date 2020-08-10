const { request } = require('graphql-request')
const { SequentialTaskQueue } = require('sequential-task-queue')
const { CronJob } = require('cron')
const ctlHelper = require('./helper')

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
        }`,
    }
  }

  removeSingleElement(arr, value) {
    arr.some((row, index) => {
      if (row.includes(value)) {
        arr.splice(index, 1)
      }
    })
    return arr
  }

  addToQueue(urlsArray) {
    const INTERVAL = 2000 // to delay parseAndSaveCourse (value in ms)

    if (urlsArray && urlsArray.length > 0) {
      // https://github.com/BalassaMarton/sequential-task-queue#readme
      const queue = new SequentialTaskQueue()
      // TODO: Run async actions sequentially: https://stackoverflow.com/questions/36672566/node-js-control-a-queue-of-promises
      urlsArray.forEach((url, index) => {
        setTimeout(() => {
          if (
            url[1].indexOf('https://www.udemy.com/') !== -1 ||
            url[1].indexOf('https://udemy.com/') !== -1
          ) {
            queue.push(() => {
              return new Promise((resolve) => {
                setTimeout(() => {
                  ctlHelper.parseAndSaveCourse(url[1], url[0])
                  resolve()
                }, INTERVAL * index)
              })
                .then((r) => {
                  console.log(
                    ctlHelper.getFullDate() +
                      ' Following course added to the queue for parsing:\n' +
                      url +
                      '\n\n'
                  )
                })
                .catch((e) => {
                  console.log(
                    ctlHelper.getFullDate() + ' SequentialTaskQueue error:\n',
                    e
                  )
                })
            })
            this.removeSingleElement(urlsArray, url[0])
            console.log(
              `${ctlHelper.getFullDate()} ThirdPartyCourses -> addToQueue -> reduced urlsArray to:\n${
                urlsArray.length
              } entries`
            )
          }
        }, index * INTERVAL)
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

  execute() {
    const getCouponsNumber = async (graphqlQuery = this.config.query) => {
      const variables = {
        myDate: new Date().toISOString().split('T')[0],
      }
      const freeCoursesIds = [],
        freeCouponsIds = []
      // see docs at: https://github.com/prisma/graphql-request
      request('https://comidoc.net/api', graphqlQuery, variables)
        .then((data) => {
          if (data && data.free) {
            JSON.parse(JSON.stringify(data.free)).forEach((course) => {
              const urlWithoutParameters = course.cleanUrl
              // Check whether the course is already in DB
              if (!ctlHelper.isAlreadyInDB(urlWithoutParameters)) {
                const courseId = course.udemyId
                const courseUrl = `https://www.udemy.com/course${urlWithoutParameters}`
                freeCoursesIds.push([courseId, courseUrl])
              }
            })
            setTimeout(() => {
              console.log(
                '\nThirdPartyCourses -> freeCourses\n',
                freeCoursesIds.join('\n') + '\n\n'
              )
              // prepare & save the post
              this.addToQueue(freeCoursesIds)
            }, 5000)
          }

          if (data && data.coupons) {
            JSON.parse(JSON.stringify(data.coupons)).forEach((obj) => {
              const urlWithoutParameters = obj.course.cleanUrl
              // Check whether the course is already in DB
              if (!ctlHelper.isAlreadyInDB(urlWithoutParameters)) {
                const courseId = obj.course.udemyId
                const freeCoupon = `https://www.udemy.com/course${urlWithoutParameters}?couponCode=${obj.course.coupon[0].code}`
                freeCouponsIds.push([courseId, freeCoupon])
              }
            })
            setTimeout(() => {
              console.log(
                '\nThirdPartyCourses -> freeCoupons\n',
                freeCouponsIds.join('\n') + '\n\n'
              )
              // prepare & save the post
              this.addToQueue(freeCouponsIds)
            }, 10000)
          }
        })
        .catch((err) => {
          console.log(
            ctlHelper.getFullDate() + ' GraphQL response errors:\n',
            err
          )
        })
    }

    getCouponsNumber()
  }

  automate() {
    // https://www.npmjs.com/package/cron
    // https://github.com/kelektiv/node-cron
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
    this.jobs.nextDates(5).forEach((d) => {
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
