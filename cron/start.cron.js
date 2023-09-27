const { newsJob } = require('./news.cron')
const { CronJob } = require('cron')

// Tâches cron

function start(client) {
  console.log('🚀 Lancement des tâches cron')

  const newsJobCron = new CronJob(
    '30 10 * * *',
    () => newsJob(client),
    null,
    true,
    'Europe/Paris'
  )
  newsJobCron.start()
}

module.exports = {
  start,
}
