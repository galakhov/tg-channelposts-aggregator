const express = require('express')
const router = express.Router()

const dashboard = require('../controllers/dashController')

router.get('/api/v1/posts', dashboard.listAllPosts)

module.exports = router
