const dashboard = require('../controllers/dashController')

const dashRoutes = app => {
  app.route('/api/v1/posts').get(dashboard.list_all_msgs)
}

module.exports = dashRoutes
