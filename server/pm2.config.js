module.exports = {
  apps: [
    {
      name: 'tg-aggregator-backend',
      instances: 1,
      script: './server.js',
      exec_mode: 'cluster',
      env: {
        BOT_TOKEN: process.env.BOT_TOKEN,
        DB_CONNECTION_STRING: process.env.DB_CONNECTION_STRING,
        NODE_ENV: process.env.NODE_ENV,
        SERVER_IP: process.env.SERVER_IP,
        PORT: 8080
      },
      max_memory_restart: '256M',
      watch: false
    }
  ]
}
