const mongoose = require('mongoose')
// in case you need debugging
// mongoose.set('debug', true)
mongoose.Promise = global.Promise

let db_uri
if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
  db_uri =
    `${process.env.DB_CONNECTION_STRING}` ||
    'mongodb://localhost/TelegramChannelDB'
} else {
  // const MongoClient = require('mongodb').MongoClient
  // db_uri = `${process.env.DB_HOST_PREFIX}${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}${process.env.DB_HOST_OPTS}`
  db_uri = `${process.env.DB_CONNECTION_STRING}`
}

// console.log('mongoose.connector: db_uri\n', db_uri)

mongoose
  .connect(db_uri, {
    // dbName: process.env.DB_NAME,
    useNewUrlParser: true,
    // reconnectInterval: 500,
    // reconnectTries: 10,
    useUnifiedTopology: true // http://mongodb.github.io/node-mongodb-native/3.3/reference/unified-topology/
    // useMongoClient: true
    // https://stackoverflow.com/questions/48917591/fail-to-connect-mongoose-to-atlas/48917626#48917626
  })
  .catch(error => {
    console.error('-------- mongoose.connection error\n', error)
  })

/* const friendSchema = new mongoose.Schema({
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

module.exports = Friends */
