module.exports = {
  apps: [
    {
      name: 'tg',
      instances: 1,
      script: './server.js',
      exec_mode: 'cluster',
      env: {
        BOT_TOKEN: process.env.BOT_TOKEN,
        PORT: 8081
      },
      max_memory_restart: '300M',
      watch: false
    }
  ]
}
