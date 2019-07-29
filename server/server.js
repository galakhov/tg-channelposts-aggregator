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

if (process.env.NODE_ENV === 'production') {
  const MongoClient = require('mongodb').MongoClient
  const uri = `mongodb+srv://${process.env.DB_USER}:${
    process.env.DB_PASSWORD
  }@${process.env.DB_HOST}.mongodb.net/test?retryWrites=true&w=majority`
  const client = new MongoClient(uri, { useNewUrlParser: true })
  client.connect(err => {
    const collection = client.db('test').collection('devices')
    // perform actions on the collection object
    client.close()
  })
} else {
  // mongoose instance connection url connection
  mongoose.Promise = global.Promise
  mongoose.connect('mongodb://localhost/TelegramChannelDB')
}

// allow cors
app.use(cors())
app.options('*', cors())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(express.static('../client/build'))

routes(app) // register routes

app.listen(port)
initBot()

console.log(`TG Channel Dashboard API server started on: ${port}`)
