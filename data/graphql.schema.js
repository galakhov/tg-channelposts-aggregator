const resolvers = require('./graphql.resolvers')
const gql = require('graphql-tag')
const { makeExecutableSchema } = require('graphql-tools')
// const typeDefs = require('./graphql.types')

/*
    // https://comidoc.net/graphql
    {
        "myDate": "2019-08-07"
    }

*/

const typeDefs = gql`
  type Query {
    getFriend(id: ID): Friend
  }

  type Friend {
    id: ID
    firstName: String
    lastName: String
    gender: Gender
    age: Int
    language: String
    email: String
    contacts: [Contact]
  }

  type Contact {
    firstName: String
    lastName: String
  }

  enum Gender {
    MALE
    FEMALE
    OTHER
  }

  input FriendInput {
    id: ID
    firstName: String!
    lastName: String
    age: Int
    language: String
    gender: Gender
    email: String
    contacts: [ContactInput]
  }

  input ContactInput {
    firstName: String
    lastName: String
  }

  type Mutation {
    createFriend(input: FriendInput): Friend
  }
`

const schema = makeExecutableSchema({ typeDefs, resolvers })

module.exports = schema
