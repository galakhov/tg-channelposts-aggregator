const express = require('express')
const router = express.Router()

const dashboard = require('../controllers/dashController')

router.get('/api/v1/posts', dashboard.listAllPosts)

const catchExceptions = func => {
  return (req, res, next) => {
    Promise.resolve(func(req, res)).catch(next)
  }
}

router.get(
  '/api/v1/posts/count',
  // userIsLoggedIn, // returns user id
  catchExceptions(async (req, res) => {
    const { postType, q } = req.query
    // logger.info(
    //   `GET /api/v1/emails/count q=${q} emailType=${postType} userId=${req.session.userId}`
    // );
    const count = await dashboard.countEmails(
      req.session.userId,
      postType,
      searchQuery
    )
    res.json({ count })
  })
)

/*
const dashboard = require('../controllers/dashController')

const dashRoutes = (app) => {
  app.route('/api/v1/msgs')
    .get(dashboard.list_all_msgs)
}

module.exports = dashRoutes


### in server.js
const routes = require('./api/routes/dashRoutes'),

(...)

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('client/build'))

routes(app) // register routes
*/

module.exports = router
