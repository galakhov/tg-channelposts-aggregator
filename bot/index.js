const Telegraf = require('telegraf')
const ThirdPartyCourses = require('../api/controllers/thirdpartyAPIController')
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

  bot.on(['inline_query'], ctx => {
    const result = []

    if (ctx.update) {
      // console.log(ctx.update)
      const {
        update: {
          inline_query: { query = '' }
        }
      } = ctx
      try {
        console.log('TCL: initBot -> update', update)
        // const queryJSON = JSON.parse(update)
        console.log('TCL: initBot -> inline_query', inline_query)
        // const query = queryJSON.inline_query.query
        console.log('TCL: initBot -> query', query)
        // if (query === 'checkCoupons') {
        //   const runThirdPartyApi = new ThirdPartyCourses()
        //   runThirdPartyApi.execute()
        // }
        // dashboard.updatePost(update)
        // ctx.telegram.answerInlineQuery(ctx.inlineQuery.id, result)

        /*
          collection[] = [
            "type" => "article",
            "id" => "$i",
            "title" => "$titles[$i]",
            "message_text" => "$titles[$i]\n$snippets[$i]\n$urls[$i]",
          ]
        */
      } catch (e) {
        ctx.reply('// TG channel bot inline_query error', e)
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
