import validator from 'validator'
import { DailyContests } from '../models/daily-contests.mjs'
import { Questions } from '../models/questions.mjs'
import { Users } from '../models/users.mjs'
import { db } from '../utils/db.mjs'

//for dev
let start = false
export async function dailyContestResult(client) {
  //if (start) return
  console.log('🚀 Lancement de la tâche DAILY CONTEST RESULT')

  const channel = client.channels.cache.get(process.env.CHANNEL_BLABLA_ID)

  if (!channel) {
    console.error('Channel not found')
    return
  }

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
  const question = await Questions.findById(dailyContests.questionId)
  if (!question) return console.error('Question not found')

  const answersWithEmoji = dailyContests.answers.map((qa) => {
    const an = question.answers.find((a) => a._id.toString() === qa.answerId)
    return {
      ...qa.toObject(),
      isGood: an.type === 'good',
      answer: an.answer,
    }
  })

  //repondre à la question
  const goodAnswers = answersWithEmoji.filter((a) => a.isGood)
  const badAnswers = answersWithEmoji.filter((a) => !a.isGood)
  const goodUsers = dailyContests.userAnswers.filter((ua) =>
    ua.answers.every((a) => goodAnswers.find((ga) => ga.emoji === a))
  )

  const badUsers = dailyContests.userAnswers.filter((ua) =>
    ua.answers.some((a) => badAnswers.find((ba) => ba.emoji === a))
  )
  let content = `## Résultat de la question du jour\n${validator.unescape(
    question.question
  )}\n\n`
  content += `### Bonnes réponses
    ${goodAnswers.map((a) => `${a.emoji} : ${a.answer}`).join('\n')}
    `

  if (goodUsers.length) {
    content += `\n### Gagnant${goodUsers.length > 1 ? 's' : ''}
    ${goodUsers.map((ua) => `<@${ua.providerAccountId}>`).join(' ')}
    `
  }

  if (badUsers.length) {
    content += `\n### Perdant${badUsers.length > 1 ? 's' : ''}
    ${badUsers.map((ua) => `<@${ua.providerAccountId}>`).join(' ')}
    `
  }

  //Répondre au message
  const message = await channel.messages.fetch(dailyContests.messageId)

  //Mettre à jour le portefeuille des utilisateurs
  const incrementValue = 10 * goodUsers.length
  await Users.updateMany(
    {
      providerAccountId: {
        $in: goodUsers.map((ua) => ua.providerAccountId),
      },
    },
    { $inc: { wallet: incrementValue } }
  )

  message.reply(content)
}
