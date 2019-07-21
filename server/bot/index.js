const Telegraf = require('telegraf')

const Msg = require('../api/models/msgModel'),
  dashboard = require('../api/controllers/dashController')

const bot = new Telegraf(process.env.BOT_TOKEN)

const initBot = () => {
  console.log('-------- initBot')
  bot.start(ctx => {
    console.log('started: ', ctx.from.id)
    ctx.reply('Hello there!')
    return true
  })

  bot.on(['channel_post'], ctx => {
    if (ctx.channelPost) {
      console.log(ctx.channelPost)
      try {
        dashboard.create_a_msg(ctx.channelPost)
      } catch (e) {
        ctx.reply('// TG channel bot save error', e)
      }
    }
  })

  bot.on(['edited_channel_post'], ctx => {
    console.log('hear edited', ctx)
    if (ctx.update) {
      console.log(ctx.update)
      const { update } = ctx
      try {
        dashboard.update_a_msg(update)
      } catch (e) {
        ctx.reply('// TG channel bot update error', e)
      }
    }
  })

  bot.startPolling()
  console.log('-------- Bot polling')
}

module.exports = initBot
