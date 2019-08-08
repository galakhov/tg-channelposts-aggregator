// const fetch = require('node-fetch')
const { request } = require('graphql-request')

class ThirdPartyCourses {
  constructor(config) {
    this.config = config || {
      // Get Daily courses (coupons & free)
      query: `query getDailyCourses($myDate: DateTime) {
            free: courses(
                where: { isFree: true, updatedAt_gte: $myDate }
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

  execute() {
    const getCouponsNumber = async (graphqlQuery = this.config.query) => {
      const variables = {
        myDate: new Date().toISOString().split('T')[0]
      }

      // see docs at: https://github.com/prisma/graphql-request
      request('https://comidoc.net/api', graphqlQuery, variables)
        .then(data => {
          if (data && data.free) {
            console.log(JSON.stringify(data.free, undefined, 4))
          }
          if (data && data.coupons) {
            console.log(
              'data.coupons',
              JSON.stringify(data.coupons, undefined, 4)
            )
          }
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
}

module.exports = ThirdPartyCourses
