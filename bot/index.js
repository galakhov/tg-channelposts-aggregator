const Telegraf = require('telegraf')

const Post = require('../api/models/postModel'),
  dashboard = require('../api/controllers/dashController')

const bot = new Telegraf(process.env.BOT_TOKEN)

const initBot = () => {
  console.log('-------- initBot')
  bot.start(ctx => {
    // console.log('started: ', ctx.from.id)
    ctx.reply('Hello! I have started!')
    return true
  })

  bot.on(['channel_post'], ctx => {
    if (ctx.channelPost) {
      // console.log('NEW POST HAS ARRIVED: ', ctx.channelPost)
      try {
        dashboard.addPost(ctx.channelPost)
      } catch (e) {
        ctx.reply('// TG channel bot save error', e)
      }
    }
  })

  bot.on(['edited_channel_post'], ctx => {
    console.log('EDITING: ', ctx)
    if (ctx.update) {
      console.log(ctx.update)
      const { update } = ctx
      try {
        dashboard.updatePost(update)
      } catch (e) {
        ctx.reply('// TG channel bot update error', e)
      }
    }
  })

  bot.startPolling()
  console.log('-------- Bot polling')
}

module.exports = initBot
