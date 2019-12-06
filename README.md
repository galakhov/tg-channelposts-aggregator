# Telegram channels' posts aggregator

🚧 ...Work in progress... 🚧

📩 📭 Aggregates posts from your telegram channel(s) assigned to your bot(s), filters the data, saves it into MongoDB & renders the data using React (see the **client** folder).

# Features & Technologies 💡

- [telegraf.js](https://telegraf.js.org/#/?id=features)
- [cheerio](https://www.npmjs.com/package/cheerio)
- [sync-request](https://www.npmjs.com/package/sync-request) but consider [then-request](https://github.com/then/then-request)
- [normalize-url](https://www.npmjs.com/package/normalize-url)
- @multifeed_edge_bot to aggregate and [redirect](https://github.com/galakhov/tg-channelposts-aggregator/tree/master/server) messages from a set of channels
- [ElasticSearch](https://www.elastic.co)
- [monstache](https://rwynn.github.io/monstache-site/)

# Server Tools and DB 🔧🗄️

I suggest to choose Robo 3T or similar tool to monitor the local MongoDB installation.

For testing purposes you can use the free [MongoDB Atlas Cluster](https://docs.atlas.mongodb.com/reference/free-shared-limitations/#atlas-free-tier). Just follow [this](https://docs.atlas.mongodb.com/getting-started/#create-an-service-account) tutorial.

# Architecture 🏗️🧱 and Required Puzzles 🧩

## Bot #1: Posts Collector 🤖

I'm using the [@multifeed_edge_bot](https://telegra.ph/Help---multifeed-edge-bot-07-06) bot to [redirect messages automatically](https://telegra.ph/Add-new-redirection-on-multifeed-edge-bot-07-06) from a set of chosen Telegram channels to my own private channel I've created.

## Bot #2: Data Processing 🤖

I've created another bot with the Telegram's [BotFather](https://core.telegram.org/bots#6-botfather) and saved the provided BOT_TOKEN in the `.env` file. I've then assigned this bot to my channel (the bot must be admin of this channel), which monitors the new posts (see: bot.on(['channel_post'] ...)) and posts' changes (see: bot.on(['edited_channel_post'] ...)).

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

ES_CONNECTION_URI="https://elasticUser:elasticPassword@domain.found.io:9243/nameOfYourDbCollection"
```

# Sync Elastic Database with the MongoDB

The ElasticSearch needs its own database — a duplicate of an existing DB (in this case it's the MongoDB) — in order to index the specified MongoDB collections and fields in its own manner (e.g. see the SearchService in client/src/services/search/index.js).

To hold the MongoDB and ElasticSearch DBs in sync in real-time, the _monstache_ GO daemon should be either:

1. auto-started from its separate docker container and be pre-configured in the (global) [docker-compose.yml file](https://github.com/rwynn/monstache/blob/master/docker/test/docker-compose.test.yml) (e.g. with the "restart: always" or "restart:unless-stopped" option) OR
2. installed globally considering its dependencies and then run as a persistent (daemonized) process.

In case of running in the docker container, the **MONGO_DB_URL** & **ELASTIC_SEARCH_URL** environment variables should be set to run in production (e.g. in your CI platform), as the monstache services depends on the MongoDB (see [mongo-0](https://github.com/rwynn/monstache/blob/master/docker/test/docker-compose.test.yml#L56)) and on ElasticSearch (see [es6](https://github.com/rwynn/monstache/blob/master/docker/test/docker-compose.test.yml#L93)) services.

Keep in mind that the **prerequisite** for the _global installation_ (2) is the [Go Lang](https://golang.org/doc/install) that should also be installed on your machine.

_Global_ Monstache installation steps are well described on their official [site](https://rwynn.github.io/monstache-site/start/).

Additionally, the monstache should be properly configured (for the default settings see the [monstache.config.default.toml file](https://github.com/galakhov/tg-channelposts-aggregator/blob/master/monstache.config.default.toml)). The monstache configuration options are very extensive. For instance, an advanced configuration allows to [watch changes of specific fields](https://rwynn.github.io/monstache-site/advanced/#watching-changes-on-specific-fields-only) or even apply [transformations](https://rwynn.github.io/monstache-site/advanced/#transformation) using such libraries as [otto](https://github.com/robertkrimen/otto) or [Underscore](http://underscorejs.org), filterin out or alterin some of the data in _real-time_ (see commented lines in [this example](https://github.com/galakhov/tg-channelposts-aggregator/blob/master/monstache.config.default.toml#L27)).

The persistent monstache process can be finally started like this:

```
monstache -f monstache.config.toml &
```

If monstache's docker container is the best option, the monstache.config.toml should be probably copied over (if it's not being done by default) to the monstache docker container, i.e. written in the corresponding monstache's Dockerfile as a COPY directive.

Some limited docs on the monstache's Docker containers are available on their [site](https://rwynn.github.io/monstache-site/advanced/#docker).

Monstache Docker container's github repo: [github.com/rwynn/monstache](https://github.com/rwynn/monstache/tree/master/docker/release).

# Debugging 🐞

Debugging a node application on a VPS, cloud, or a dedicated server can be tricky. As simple loggers I'd suggest to use such tools as: `pm2 logs --lines 500` or `node --inspect-brk=0.0.0.0:9229 server.js`. Both tools should start from the application's directory the node is running from. PM2 will be installed globally during `postinstall` procedure anyway (see package.json and its "scripts" section).

Read this [pm2 documentation](http://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/) for more details.

Additionally, to pipe & save all the stdout logs to a file, the following line can be added to the docker-compose.yml file right before the CMD:

```
RUN ln -sf /dev/stdout /debug.log
```

# Credits 🙏

Inspired by and based on this [repo](https://github.com/foreseaz/tg-channel-dashboard).
