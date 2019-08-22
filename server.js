const dotenv = require('dotenv')
dotenv.config()
require('./data/mongoose.connector')

// const ThirdPartyCourses = require('./api/controllers/thirdpartyAPIController')

const express = require('express'),
  app = express(),
  port = process.env.PORT || 8080,
  cors = require('cors'),
  bodyParser = require('body-parser'),
  Post = require('./api/models/postModel'),
  initBot = require('./bot/index')
// ,router = express.Router()

// const graphqlHTTP = require('express-graphql')
// const schema = require('./data/graphql.schema')

// app.use(
//   '/graphql',
//   graphqlHTTP({
//     schema: schema,
//     graphiql: true
//   })
// )

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
// register routes
// routes(app)

const dashboard = require('./api/controllers/dashController')
app.get('/api/v1/posts', dashboard.listAllPosts)
app.use(express.static('client/build'))

app.listen(port)
initBot()

console.log(`-------- TG Channel Dashboard API server started on: ${port}\n\n`)

// module.exports = router
