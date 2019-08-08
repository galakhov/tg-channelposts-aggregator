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

      request('https://comidoc.net/api', graphqlQuery, variables)
        .then(response => response.json())
        .then(data => {
          if (data && data.free) {
            console.log(data.free)
          }
          // data.json()
          if (data && data.coupons) {
            console.log('data.coupons', data.coupons)
            // return data.coupons
          }
        })
        .catch(err => {
          console.log('GraphQL response errors: ', err) // GraphQL response errors
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
