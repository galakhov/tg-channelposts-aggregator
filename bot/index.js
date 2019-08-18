const Telegraf = require('telegraf')
const ThirdPartyCourses = require('../api/controllers/thirdpartyAPIController')
const Post = require('../api/models/postModel')
const dashboard = require('../api/controllers/dashController')

const bot = new Telegraf(process.env.BOT_TOKEN)

const initBot = () => {
  console.log('\n\n-------- initBot\n')
  bot.start(ctx => {
    ctx.reply('Hello! I have started!')
    return true
  })

  bot.on(['channel_post'], ctx => {
    if (ctx.channelPost) {
      try {
        dashboard.addPost(ctx.channelPost)
      } catch (e) {
        ctx.reply('// TG channel bot save error', e)
      }
    }
  })

  bot.on(['inline_query'], ctx => {
    // const result = []

    if (ctx.update) {
      console.log('ctx.update???', ctx.update)
      try {
        if (ctx.update) {
          const { query = '' } = ctx.update ? ctx.update.inline_query : {}
          console.log('initBot -> update query:\n', query)
          if (query === 'checkCoupons') {
            const runThirdPartyApi = new ThirdPartyCourses()
            // simulate a crob job
            runThirdPartyApi.execute()
          }
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
        }
      } catch (e) {
        // ctx.reply('// TG channel bot inline_query error', e)
        console.log('ERROR: TG channel bot inline_query error:\n', e)
      }
    }
  })

  bot.on(['edited_channel_post'], ctx => {
    console.log('EDITING:\n', ctx)
    if (ctx.update) {
      console.log(ctx.update)
      const { update } = ctx
      try {
        dashboard.updatePost(update)
      } catch (e) {
        ctx.reply('-------- TG channel bot update error\n', e)
      }
    }
  })

  bot.startPolling()
  console.log('-------- Bot polling\n')

  // start the cron job
  console.log(`\n-------- Starting Cron Job`)
  const runThirdPartyApi = new ThirdPartyCourses()
  runThirdPartyApi.automate()
}

module.exports = initBot
