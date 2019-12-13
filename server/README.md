# Server Tools and DB 🔧🗄️

I suggest to choose Robo 3T or similar tool to monitor the local MongoDB installation.

For testing purposes you can, for instance, use the free [MongoDB Atlas Cluster](https://docs.atlas.mongodb.com/reference/free-shared-limitations/#atlas-free-tier). Just follow [this](https://docs.atlas.mongodb.com/getting-started/#create-an-service-account) tutorial.

# Architecture 🏗️🧱 and Required Puzzles 🧩

## Bot #1: Posts Collector 🤖

I'm using the [@multifeed_edge_bot](https://telegra.ph/Help---multifeed-edge-bot-07-06) bot to [redirect messages automatically](https://telegra.ph/Add-new-redirection-on-multifeed-edge-bot-07-06) from a set of chosen Telegram channels to my own private channel I've created.

## Bot #2: Data Processing 🤖

I've created another bot with the Telegram's [BotFather](https://core.telegram.org/bots#6-botfather) and saved the provided BOT_TOKEN in the `.env` file. I've then assigned this bot to my channel (the bot must be admin of this channel), which monitors the new posts (see [bot.on(['channel_post'] ...)](https://github.com/galakhov/tg-channelposts-aggregator/blob/master/bot/index.js#L15)) and posts' changes (see [bot.on(['edited_channel_post'] ...)](https://github.com/galakhov/tg-channelposts-aggregator/blob/master/bot/index.js#L58)).

This bot is configured to send all the new incoming posts from your Telegram Channel to the main controller first (see ./bot/index.js and ./api/controllers/dashController.js files). The controller processes the received data accordingly.

Even though this setup would also work in production, I'd suggest to install and configure the second bot on your VPS, VM or elsewhere.

# Configuration, set up & Deployment 📋

To run the app locally on your machine, you'll need to create a new file for the environment variables in the `server`'s directory:

```
touch .env & open .env
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
# see ./data/mongoose.connector.js for the complete db_uri

HOST=
PORT=
CI=

BOT_TOKEN=123456789:AAH54XXXMBUXXXPz4XX-fbeXXXTXYYYY

ES_CONNECTION_URI="https://elasticUser:elasticPassword@domain.found.io:9243/nameOfYourDbCollection"
```

### Installation using Docker & Docker Compose

```bash
docker-compose --version
docker-compose up --build --force-recreate
```

### Installation without Docker for local development

```bash
npm install
```

Start the local development:

```bash
npm run dev
```

#### To start monitoring (using [pm2](http://pm2.io)):

```bash
npm start tg-aggregator -l ./logs/pm2/logs.log
pm2 monit # to start the console-based monitoring (see below)
```

In production, for instance in the Travis CI UI, you can set the environment variables [in the repository settings section](https://docs.travis-ci.com/user/environment-variables/#defining-variables-in-repository-settings). If you prefer GitLab CI, you can also [define a set of your own custom environment variables in their UI](https://docs.gitlab.com/ce/ci/variables/README.html#creating-a-custom-environment-variable). Other modern CI tools such as [Jenkins](https://jenkins.io/doc/book/using/using-credentials/#configuring-credentials) or [Drone](https://drone.io) do as well allow you to configure [secrets keys](https://docs.drone.io/configure/secrets/repository/) (i.e. environment constants) for a repository or for a whole organization.

# Monitoring & Debugging 🐞

Debugging a node application on a VPS, cloud, or a dedicated server can be tricky. To start with a simple logger I'd suggest to use [pm2](http://pm2.io): `pm2 logs --lines 500`. In production you would probably want to run it as a [restartable process](https://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/#complete-tutorial) that restarts itself in case if the node instance crashes: `pm2 startOrRestart pm2.config.js start server.js <app-name> -l /path/to/logs/logs.log` (see [start](https://github.com/galakhov/tg-channelposts-aggregator/blob/master/package.json#L38) script in package.json) followed by the command to monitor that process `pm2 monit` or `pm2 plus`.

To emulate an automatic load balancer, you can start your node instance in a [cluster mode](https://pm2.keymetrics.io/docs/usage/cluster-mode/): `pm2 startOrRestart pm2.config.js start server.js <app-name> -i max`

Another option would be to use node itself, however, I wouldn't recommend this workaround for the production environment: `node --inspect-brk=0.0.0.0:9229 server.js`.

Both tools should start from the application's directory the node is running from. In this project PM2 will be installed globally during `postinstall` procedure anyway (see package.json and its "scripts" section for more details).

Read this [pm2 documentation](http://pm2.keymetrics.io/docs/usage/pm2-doc-single-page/) for more details.

Additionally, to pipe & save all the stdout logs to a file, the following line can be added to the docker-compose.yml file right before the CMD:

```
RUN ln -sf /dev/stdout /debug.log
```

# Sync Elastic Database with the MongoDB

The ElasticSearch needs its own database—a duplicate of an existing DB (in this case it's the MongoDB)—in order to index the specified MongoDB collections and fields in its own manner (e.g. see the SearchService in client/src/services/search/index.js).

To hold the MongoDB and ElasticSearch DBs in sync in real-time, the _monstache_'s GO daemon should be either:

1. auto-started from its separate docker container and be pre-configured in the (global) [docker-compose.yml file](https://github.com/rwynn/monstache/blob/master/docker/test/docker-compose.test.yml) (this installation procedure allows to use such helpful docker features like monitoring of a process' health and auto-restart in case of errors, e.g. with the "restart: always" or `restart_policy: condition: on-failure`) OR
2. installed globally considering its dependencies and then run as a persistent (daemonized) process.

### 1. Installation using Docker

If the monstache's docker container is the best option for your architecture, the monstache.config.toml should be probably copied over (if it's not being done already by default) to the monstache docker container, i.e. written in the corresponding monstache's Dockerfile as a COPY directive. Again, see their [docker-compose.yml](https://github.com/rwynn/monstache/blob/master/docker/test/docker-compose.test.yml) and [monstache.config.default.toml](https://github.com/galakhov/tg-channelposts-aggregator/blob/master/monstache.config.default.toml) files for more details.

In case of running in the docker container, the **MONGO_DB_URL** & **ELASTIC_SEARCH_URL** (in my case it's ES_CONNECTION_URI) environment variables should be set to run in production (e.g. inside of your CI platform), as the monstache services depends on the MongoDB (see [mongo-0](https://github.com/rwynn/monstache/blob/master/docker/test/docker-compose.test.yml#L56)) and on ElasticSearch (see [es6](https://github.com/rwynn/monstache/blob/master/docker/test/docker-compose.test.yml#L93)) services.

Some limited docs on the monstache's Docker containers are available on their [site](https://rwynn.github.io/monstache-site/advanced/#docker).

Monstache Docker container's github repo: [github.com/rwynn/monstache](https://github.com/rwynn/monstache/tree/master/docker/release).

### 2. Global Installation

Keep in mind that the **prerequisite** for the _global installation_ is the [Go Lang](https://golang.org/doc/install) that should also be installed on your machine.

Global monstache installation steps are well described on their official [site](https://rwynn.github.io/monstache-site/start/).

Additionally, the monstache should be properly configured (for the default settings see the [monstache.config.default.toml file](https://github.com/galakhov/tg-channelposts-aggregator/blob/master/monstache.config.default.toml)).

The persistent monstache process can be finally started like that:

```
monstache -f monstache.config.toml &
```

### The power of monstache

The monstache configuration options are very extensive. For instance, an advanced configuration allows to [watch changes of specific fields](https://rwynn.github.io/monstache-site/advanced/#watching-changes-on-specific-fields-only) or even apply [transformations](https://rwynn.github.io/monstache-site/advanced/#transformation) using such libraries as [otto](https://github.com/robertkrimen/otto) or [Underscore](http://underscorejs.org), filterin out or alterin some of the data in _real-time_ (see commented lines in [this example](https://github.com/galakhov/tg-channelposts-aggregator/blob/master/monstache.config.default.toml#L27)).
