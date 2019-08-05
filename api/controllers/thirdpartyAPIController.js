const fetch = require('node-fetch')

class ThirdPartyCourses {
  constructor(config) {
    this.config = config || {
      // Get Daily courses (coupons & free)
      query: `query DAILY_COURSES_QUERY($myDate: DateTime) {
    free: courses(
      where: { isFree: true, updatedAt_gte: $myDate }
      orderBy: createdAt_DESC
    ) {
      udemyId
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
        }
      }
    }`
    }
  }

  execute() {
    const getCouponsNumber = async (graphqlQuery = this.config.query) => {
      const response = await fetch('https://comidoc.net/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          graphqlQuery,
          variables: {
            myDate: new Date().toISOString().split('T')[0]
          }
        })
      })
      const resJSON = await response.json()

      if (resJSON.data.coupons) {
        console.log('resJSON.data.coupons', resJSON.data.coupons)
        return resJSON.data.coupons
      }
    }

    const coupons = getCouponsNumber()
    console.log('COUPONS CHECKED: ', coupons)
  }
}

module.exports = ThirdPartyCourses
