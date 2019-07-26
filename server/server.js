const dotenv = require('dotenv')
dotenv.config()

const express = require('express'),
  app = express(),
  port = process.env.PORT || 8081,
  cors = require('cors'),
  mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  Post = require('./api/models/postModel'),
  routes = require('./api/routes/dashRoutes'),
  initBot = require('./bot/index')

// mongoose instance connection url connection
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost/TelegramChannelDB')

// allow cors
app.use(cors())
app.options('*', cors())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('client/build'))

routes(app) // register routes

app.listen(port)
initBot()

console.log(`TG Channel Dashboard API server started on: ${port}`)
