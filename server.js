const dotenv = require('dotenv')
dotenv.config()

const express = require('express'),
  app = express(),
  port = process.env.PORT || 8080,
  cors = require('cors'),
  bodyParser = require('body-parser'),
  Post = require('./api/models/postModel'),
  initBot = require('./bot/index')
// ,router = express.Router()

const mongoose = require('mongoose')
// in case you need debugging
// mongoose.set('debug', true)
// mongoose instance connection url connection
mongoose.Promise = global.Promise

let db_uri
if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
  db_uri = 'mongodb://localhost/TelegramChannelDB'
} else {
  // const MongoClient = require('mongodb').MongoClient
  db_uri = `${process.env.DB_HOST_PREFIX}${process.env.DB_USER}:${
    process.env.DB_PASSWORD
  }@${process.env.DB_HOST}/${process.env.DB_NAME}${process.env.DB_HOST_OPTS}`
}
console.log('db_uri:', db_uri)
mongoose
  .connect(db_uri, {
    // https://stackoverflow.com/questions/48917591/fail-to-connect-mongoose-to-atlas/48917626#48917626
    dbName: process.env.DB_NAME,
    useNewUrlParser: true,
    reconnectInterval: 500,
    reconnectTries: 10
  })
  .catch(error => {
    console.log('mongoose.connection error', error)
  })

// allow cors
app.use(cors())
app.options('*', cors())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// if (process.env.NODE_ENV === 'production') {
// const path = require('path')
// app.use(express.static(path.join(__dirname, 'client/build')))

// app.get(/^\/|\/about|\/edit\/?$/i, (req, res) => {
//   // if (req.url === '/api/v1/posts' || req.url === '/login') return next()
//   res.sendFile(path.join(__dirname + '/client/build', 'index.html'))
// })

// app.use(express.static('client/build'))

// An api endpoint that returns a short list of items
// app.get('/api/v1/posts', (req, res) => {
//   // const posts = []
//   // res.set('Content-Type', 'application/json')
//   res.type('json')
//   // res.json()
//   console.log('Response from the API:', res)
//   console.log('List of posts initialized')
// })

// simple logger for this router's requests
// all requests to this router will first hit this middleware
// router.use('/api/v1/posts', (req, res, next) => {
//   console.log('%s %s %s', req.method, req.url, req.path)
//   next()
// })
// router.use('/api/v1/posts', require('./api/routes/dashRoutes'))

const dashboard = require('./api/controllers/dashController')
app.get('/api/v1/posts', dashboard.listAllPosts)
app.use(express.static('client/build'))

// register routes
// routes(app)

app.listen(port)
initBot()

console.log(`TG Channel Dashboard API server started on: ${port}`)

// module.exports = router
