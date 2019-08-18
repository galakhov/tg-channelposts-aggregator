const mongoose = require('mongoose')
// in case you need debugging
// mongoose.set('debug', true)
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

mongoose
  .connect(db_uri, {
    // https://stackoverflow.com/questions/48917591/fail-to-connect-mongoose-to-atlas/48917626#48917626
    dbName: process.env.DB_NAME,
    useNewUrlParser: true,
    reconnectInterval: 500,
    reconnectTries: 10
    // useMongoClient: true
  })
  .catch(error => {
    console.log('-------- mongoose.connection error\n', error)
  })

const friendSchema = new mongoose.Schema({
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  gender: {
    type: String
  },
  age: {
    type: Number
  },
  language: {
    type: String
  },
  email: {
    type: String
  },
  contacts: {
    type: Array
  }
})

const Friends = mongoose.model('friends', friendSchema)

module.exports = Friends
