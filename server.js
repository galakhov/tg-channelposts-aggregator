const dotenv = require('dotenv')
dotenv.config()
require('./data/mongoose.connector')
const Post = require('./api/models/postModel')
const catchExceptions = require('./api/controllers/helper').catchExceptions
const express = require('express'),
  app = express(),
  port = process.env.PORT || 8081,
  cors = require('cors'),
  bodyParser = require('body-parser'),
  initBot = require('./bot/index')
// ,router = express.Router()

// const ThirdPartyCourses = require('./api/controllers/thirdpartyAPIController')

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

const MAX_POSTS_PER_PAGE = 50

app.get(
  '/api/v1/posts/count',
  // userIsLoggedIn, // returns user id
  catchExceptions(async (req, res) => {
    const { postType, searchQuery } = req.query
    console.log('-------- postType', postType)
    const count = await dashboard.countPosts(
      null, // req.session.userId,
      'countPosts', // postType,
      searchQuery
    )
    res.json({ count })
  })
)

app.get(
  '/api/v1/posts',
  catchExceptions(async (req, res) => {
    let { offset = 0, limit = MAX_POSTS_PER_PAGE } = req.query
    // offset = (pageNumber - 1) * limit
    console.log(`-------- GET /api/v1/posts?offset=${offset}&limit=${limit}`)
    offset = parseInt(offset)
    limit = parseInt(limit)
    limit = Math.min(limit, MAX_POSTS_PER_PAGE) // either limit or the MAX const
    console.log('-------- offset: ', offset)
    console.log('-------- limit: ', limit)

    const posts = await dashboard.listAllPosts(
      {
        // req.session.userId,
        offset,
        limit
      },
      (err, posts) => {
        if (err) {
          console.log('-------- listAllPosts Error:', err)
          return err
        } else {
          // console.log('-------- listAllPosts Result\n', result)
          return res.json({ posts })
        }
      }
    )
  })
)

app.get(
  '/api/v1/search',
  // userIsLoggedIn,
  catchExceptions(async (req, res) => {
    let { searchQuery, offset, limit } = req.query
    console.log(
      `-------- GET /api/v1/search q=${searchQuery} offset=${offset} limit=${limit}`
    )
    offset = parseInt(offset)
    limit = parseInt(limit)
    limit = Math.min(limit, MAX_POSTS_PER_PAGE)
    const emails = await dashboard.search(
      // req.session.userId,
      searchQuery,
      offset,
      limit
    )
    res.json(posts)
  })
)

app.use(express.static('client/build'))

app.listen(port)
initBot()

console.log(`-------- TG Channel Dashboard API server started on: ${port}\n\n`)

// module.exports = router
