const express = require('express')
const router = express.Router()

const dashboard = require('../controllers/dashController')

router.get('/api/v1/posts', dashboard.listAllPosts)

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
