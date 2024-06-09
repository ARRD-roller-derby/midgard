import { client } from '../../index.mjs'
import { DailyContests } from '../models/daily-contests.mjs'
import { db } from '../utils/db.mjs'

//for dev
let start = false

export async function dailyContestCleanReaction() {
  // if (start) return
  console.log('🚀 Lancement de la tâche DAILY CONTEST RESULT')

  const channel = client.channels.cache.get(process.env.CHANNEL_BLABLA_ID)
  if (!channel) return

  start = true
  await db()

  const dailyContests = await DailyContests.findOne({
    updatedAt: {
      //Uniquement celui du jour
      $gte: new Date(new Date().setHours(0, 0, 0, 0)),
      $lt: new Date(new Date().setHours(23, 59, 59, 999)),
    },
  })

  if (!dailyContests) return console.log('No daily contest today')

  const message = await channel.messages.fetch(dailyContests.messageId)
  if (!message) return console.error('Message not found')

  const countdownEmojis = ['3️⃣', '2️⃣', '1️⃣', '0️⃣']

  for (const emoji of countdownEmojis) {
    await message.react(emoji)
    await new Promise((resolve) => setTimeout(resolve, 10000)) // Attendre 10 secondes avant de passer au prochain émoji
  }

  await message.reactions.removeAll()
  await Promise.all(
    dailyContests.answers.map((answer) => {
      return message.react(answer.emoji)
    })
  )
}
