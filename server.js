const dotenv = require('dotenv')
dotenv.config()

const express = require('express'),
  app = express(),
  port = process.env.PORT || 8081,
  cors = require('cors'),
  bodyParser = require('body-parser'),
  Post = require('./api/models/postModel'),
  routes = require('./api/routes/dashRoutes'),
  initBot = require('./bot/index')

if (process.env.NODE_ENV === 'production') {
  const MongoClient = require('mongodb').MongoClient
  const uri = `mongodb+srv://${process.env.DB_USER}:${
    process.env.DB_PASSWORD
  }@${process.env.DB_HOST}.mongodb.net/${
    process.env.DB_NAME
  }?retryWrites=true&w=majority`
  const client = new MongoClient(uri, { useNewUrlParser: true })
  client.connect(err => {
    const collection = client
      .db(process.env.DB_NAME)
      .collection(process.env.DB_COLLECTION)
    // perform actions on the collection object
    client.close()
    if (err) {
      console.log('DB error: ', err)
    }
  })
} else {
  const mongoose = require('mongoose')
  // mongoose instance connection url connection
  mongoose.Promise = global.Promise
  mongoose.connect('mongodb://localhost/TelegramChannelDB')
}

// allow cors
app.use(cors())
app.options('*', cors())

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')))
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/client/build', 'index.html'))
  })
} else {
  app.use(express.static('client/build'))
}

routes(app) // register routes

app.listen(port)
initBot()

console.log(`TG Channel Dashboard API server started on: ${port}`)
