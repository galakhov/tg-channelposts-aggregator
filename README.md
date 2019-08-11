# Telegram channels' posts aggregator

🚧 ...Work in progress... 🚧

📩 📭 Aggregates posts from your telegram channel(s) assigned to your bot(s) (must be an admin), filters the data, saves it into MongoDB & renders the data using React (see the **client** folder).

# Features 💡

- [telegraf.js](https://telegraf.js.org/#/?id=features)
- [cheerio](https://www.npmjs.com/package/cheerio)
- [sync-request](https://www.npmjs.com/package/sync-request) but consider [then-request](https://github.com/then/then-request)
- [normalize-url](https://www.npmjs.com/package/normalize-url)
- @multifeed_edge_bot to aggregate and [redirect](https://github.com/galakhov/tg-channelposts-aggregator/tree/master/server) messages from a set of channels

# Server Tools 🔧 and DB 🗄️

I suggest to use Robo 3T or similar tools to monitor your local MongoDB installation.

For testing purposes you can use the free [MongoDB Atlas Cluster](https://docs.atlas.mongodb.com/reference/free-shared-limitations/#atlas-free-tier). Just follow [this](https://docs.atlas.mongodb.com/getting-started/#create-an-service-account) tutorial.

# Architecture 🏗️🧱 and Required Puzzles 🧩

## Bot #1: Posts Collector 🤖

I'm using the [@multifeed_edge_bot](https://telegra.ph/Help---multifeed-edge-bot-07-06) bot to [redirect messages automatically](https://telegra.ph/Add-new-redirection-on-multifeed-edge-bot-07-06) from a set of chosen Telegram channels to my own private channel I've created.

## Bot #2: Data Processing 🤖

I've created another bot with the Telegram's [BotFather](https://core.telegram.org/bots#6-botfather) and saved the provided BOT_TOKEN in the `.env` file. I've then assigned this bot to my channel (must be an admin), which monitors the new posts (see: bot.on(['channel_post'] ...)) and posts' changes (see: bot.on(['edited_channel_post'] ...)) on my channel.

This bot is configured internally to send all new posts to the main controller first (see ./bot/index.js and ./api/controllers/dashController.js). The controller processes the incoming data accordingly.

Even though this setup would also work in production, I'd suggest to install and configure this 2nd bot on your VPS or elsewhere.

# Set up 📋

Create new file in the `./server`'s root directory:

```
touch .env
```

Put the required lines into the `.env` file and fill in the required constants (at least add your BOT_TOKEN hash):

```
NODE_ENV=development
NODE_PATH=
PUBLIC_URL=

DB_HOST_PREFIX="mongodb+srv://"
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=pass
DB_NAME=db_name
DB_PORT="27017"

HOST=
PORT=
CI=

BOT_TOKEN=123456789:AAH54XXXMBUXXXPz4XX-fbeXXXTXYYYY

ELASTICSEARCH_URI="https://elasticUser:elasticPassword@domain.found.io:9243"
```

# Debugging 🐞

Debugging a node application on a VPS, cloud, or a dedicated server can be tricky. As simple loggers I'd suggest to use such tools as: `pm2 logs --lines 500` or `node --inspect-brk=0.0.0.0:9229 server.js`. Both tools should start from the application's directory the node is running from. PM2 will be installed globally during `postinstall` procedure anyway (see package.json).

Read this [pm2 documentation](http://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/) for more details.

# Credits 🙏

Inspired by and based on this [repo](https://github.com/foreseaz/tg-channel-dashboard).
