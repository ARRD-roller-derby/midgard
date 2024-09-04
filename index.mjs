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
import { dailyContestCleanReaction } from './src/jobs/daily-contest-clean-reaction.mjs'
import { dailyBadges } from './src/jobs/daily-badges.mjs'
dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)
dayjs.extend(timezone)
dayjs.extend(duration)
dayjs.extend(weekday)
dayjs.locale(fr)
dayjs.tz.guess()
dayjs.tz.setDefault('Europe/Paris')
let init = false
export let client

async function start() {
  if (init) return
  client = await botStart()

  // ===== DAILY =================================================================================================
  new CronJob('0 10 35 * *', dailyContest, null, true, 'Europe/Paris')
  new CronJob('0 18 * * *', dailyContestResult, null, true, 'Europe/Paris')
  new CronJob('0 19 30 * *', dailyBadges, null, true, 'Europe/Paris')
  // ===== WEEKLY ===============================================================================================
  new CronJob('0 11 * * 1', weekRules, null, true, 'Europe/Paris')

  new CronJob(
    '*/15 * * * *',
    dailyContestCleanReaction,
    null,
    true,
    'Europe/Paris'
  )

  console.log('Jobs started')
  init = true
}

start()
