module.exports = {
  apps: [
    {
      name: 'tg-aggregator-backend',
      instances: 1,
      script: './server.js',
      exec_mode: 'cluster',
      env: {
        BOT_TOKEN: process.env.BOT_TOKEN,
        PORT: 8080
      },
      max_memory_restart: '256M',
      watch: false
    }
  ]
}
