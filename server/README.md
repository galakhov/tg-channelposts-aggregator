# Server Tools / DB

I suggest to use Robo 3T or similar tools to monitor your local MongoDB installation.

For testing purposes you can use the free [MongoDB Atlas Cluster](https://docs.atlas.mongodb.com/reference/free-shared-limitations/#atlas-free-tier). Just follow [this](https://docs.atlas.mongodb.com/getting-started/#create-an-service-account) tutorial.

# Architecture / Required Puzzles

## Bot #1: Posts Collector

I'm using the [@multifeed_edge_bot](https://telegra.ph/Help---multifeed-edge-bot-07-06) bot for [automatic messages redirections](https://telegra.ph/Add-new-redirection-on-multifeed-edge-bot-07-06) from a set of chosen Telegram channels to my own private channel I've created.

## Bot #2: Data Processing

I've created another bot with the Telegram's [BotFather](https://core.telegram.org/bots#6-botfather) and saved the provided BOT_TOKEN in the `.env` file. I've then assigned this bot to my channel (must be an admin), which monitors (see: bot.on(['channel_post'] ...)) the new posts and posts' changes: bot.on(['edited_channel_post'] ...) on my channel.

This bot is configured internally to send all new posts first to the main controller (see ./bot/index.js and ./api/controllers/dashController.js). The controller processes the incoming bot's data accordingly.

Even though this setup would also work in production, I'd suggest to install and configure this 2nd bot on your VPS or elsewhere.

# Set up

Create new file in the `./server`'s root directory:

```
touch .env
```

Put the required lines into the `.env` file and fill in the required constants (at least add your BOT_TOKEN hash):

```
NODE_ENV=development
NODE_PATH=
PUBLIC_URL=

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=pass
DB_NAME=db_name

HOST=
PORT=
CI=

BOT_TOKEN=123456789:AAH54XXXMBUXXXPz4XX-fbeXXXTXYYYY
```
