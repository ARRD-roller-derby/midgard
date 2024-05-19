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

async function start() {
  const client = await botStart()

  const dailyContestCron = new CronJob(
    '0 10 * * *',
    () => dailyContest(client),
    null,
    true,
    'Europe/Paris'
  )

  const dailyContestResultCron = new CronJob(
    '0 18 * * *',
    () => dailyContestResult(client),
    null,
    true,
    'Europe/Paris'
  )

  //'0 12 * * 1',
  const weekRulesCron = new CronJob(
    '* * * * * *',
    () => weekRules(client),
    null,
    true,
    'Europe/Paris'
  )

  dailyContestCron.start(client)
  dailyContestResultCron.start(client)
  weekRulesCron.start(client)
  console.log('Jobs started')
}

start()
