// import mongoose from 'mongoose';
const Friends = require('./mongoose.connector')

// resolver map
const resolvers = {
  Query: {
    getFriend: ({ id }) => {
      return new Friend(id, friendDatabase[id])
    }
  },
  Mutation: {
    createFriend: (root, { input }) => {
      const newFriend = new Friends({
        firstName: input.firstName,
        lastName: input.lastName,
        gender: input.gender,
        age: input.age,
        language: input.language,
        email: input.email,
        contacts: input.contacts
      })

      newFriend.id = newFriend._id

      return new Promise((resolve, object) => {
        newFriend.save(err => {
          if (err) reject(err)
          else resolve(newFriend)
        })
      })
    }
  }
}

module.exports = resolvers
