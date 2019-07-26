const dashboard = require('../controllers/dashController')

const dashRoutes = app => {
  app.route('/api/v1/posts').get(dashboard.listAllPosts)
}

module.exports = dashRoutes
