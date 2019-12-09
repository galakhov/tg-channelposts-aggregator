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
    // const { postType } = req.query
    await dashboard.countPosts((err, count) => {
      // pass the callback function
      if (err) {
        console.log('-------- countPosts Error:', err)
        return err
      }
      return res.json({ count })
    })
  })
)

app.get(
  '/api/v1/posts',
  catchExceptions(async (req, res) => {
    let parsedOffset, parsedLimit
    // offset = (pageNumber - 1) * limit
    const { offset = -1, limit = MAX_POSTS_PER_PAGE } = req.query

    // first run: set the offset for the 1st page
    if (offset === -1) {
      let totalCount = 0
      const count = await dashboard.countPosts()
      console.log('-------- find out total count of posts', count)
      totalCount = res.json({ count })
      offset = totalCount - limit
    }
    console.log(`-------- GET /api/v1/posts?offset=${offset}&limit=${limit}`)
    parsedOffset = parseInt(offset)
    parsedLimit = parseInt(limit)

    // set either the parsed limit or the default MAX constant:
    parsedLimit = Math.min(limit, MAX_POSTS_PER_PAGE)
    console.log('-------- parsedOffset: ', parsedOffset)
    console.log('-------- parsedLimit: ', parsedLimit)

    await dashboard.listAllPosts(
      {
        // req.session.userId,
        parsedOffset,
        parsedLimit
      },
      (err, posts) => {
        // pass the callback function
        if (err) {
          console.log('-------- listAllPosts Error:', err)
          return err
        }
        return res.json({ posts })
      }
    )
  })
)

// TODO: map this route with the frontend & move elasticsearch to the backend
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
    const posts = await dashboard.search(
      // req.session.userId,
      searchQuery,
      offset,
      limit
    )
    res.json({ posts })
  })
)

app.use(express.static('client/build'))

app.listen(port)
initBot()

console.log(`-------- TG Channel Dashboard API server started on: ${port}\n\n`)

// module.exports = router
