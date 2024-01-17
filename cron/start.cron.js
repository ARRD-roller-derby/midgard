const { newsJob } = require('./news.cron')
const { CronJob } = require('cron')

// Tâches cron

function cronStart(client) {
  console.log('🚀 Lancement des tâches cron')

  const newsJobCron = new CronJob(
    '0 10 * * *',
    () => newsJob(client),
    null,
    true,
    'Europe/Paris'
  )
  newsJobCron.start()
}

module.exports = {
  cronStart,
}
