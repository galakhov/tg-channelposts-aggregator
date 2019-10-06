/*
const dailyCoursesQuery = `query getDailyCourses($myDate: DateTime) {
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

module.exports = dailyCoursesQuery
*/
