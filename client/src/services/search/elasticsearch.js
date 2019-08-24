const elasticsearch = require('elasticsearch')
// require('dotenv').config()
// https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/16.x/host-reference.html

// TODO: move Elastic Search into the server side or just import a client
const elasticClient = new elasticsearch.Client({
  cors: true,
  sniffOnStart: false,
  keepAlive: true,
  hosts: [
    `https://elastic:6GnisEFCuUS3Unbwz3TR5oza@ecfbe901bf214d008477c97a6f894235.eu-west-1.aws.found.io:9243/telegramchanneldb.posts`
    // `${process.env.ES_CONNECTION_URI}`
    // `https://${process.env.ES_USERNAME}:${process.env.ES_PASSWORD}@${
    //    process.env.ES_HOST
    //  }/${process.env.ES_NS_COLLECTION}`
  ]
})

module.exports = elasticClient
