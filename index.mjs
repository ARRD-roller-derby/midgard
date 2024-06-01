import { CronJob } from 'cron'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import localizedFormat from 'dayjs/plugin/localizedFormat.js'
import timezone from 'dayjs/plugin/timezone.js'
import duration from 'dayjs/plugin/duration.js'
import fr from 'dayjs/locale/fr.js'
import weekday from 'dayjs/plugin/weekday.js'
import { botStart } from './src/discord/discord.mjs'
import { dailyContest } from './src/jobs/daily-contest.mjs'
import { dailyContestResult } from './src/jobs/daily-contest-result.mjs'
import { weekRules } from './src/jobs/week-rules.mjs'
dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)
dayjs.extend(timezone)
dayjs.extend(duration)
dayjs.extend(weekday)
dayjs.locale(fr)
dayjs.tz.guess()
dayjs.tz.setDefault('Europe/Paris')

export let client
async function start() {
  client = await botStart()

  const dailyContestCron = new CronJob(
    '46 10 * * *',
    dailyContest,
    null,
    true,
    'Europe/Paris'
  )

  const dailyContestResultCron = new CronJob(
    '0 18 * * *',
    dailyContestResult,
    null,
    true,
    'Europe/Paris'
  )

  const weekRulesCron = new CronJob(
    '0 11 * * 1',
    weekRules,
    null,
    true,
    'Europe/Paris'
  )

  dailyContestCron.start()
  dailyContestResultCron.start()
  weekRulesCron.start()
  console.log('Jobs started')
}

start()
