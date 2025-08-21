import validator from 'validator'
import { DailyContests } from '../models/daily-contests.mjs'
import { Questions } from '../models/questions.mjs'
import { Users } from '../models/users.mjs'
import { db } from '../utils/db.mjs'
import { client } from '../../index.mjs'

//for dev
let start = false
export async function dailyContestResult() {
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

  const goodAnswers = answersWithEmoji.filter((a) => a.isGood)
  const badAnswers = answersWithEmoji.filter((a) => !a.isGood)

  const goodUsers = dailyContests.userAnswers.filter((ua) => {
    // Vérifie que l'utilisateur a donné exactement le bon nombre de réponses
    if (ua.answers.length !== goodAnswers.length) return false

    // Vérifie que toutes les réponses sont bonnes
    return ua.answers.every(
      (a) =>
        goodAnswers.find((ga) => ga.emoji === a) &&
        !badAnswers.find((ba) => ba.emoji === a)
    )
  })

  const badUsers = dailyContests.userAnswers.filter((ua) => {
    // L'utilisateur est considéré comme mauvais s'il a:
    // - Soit donné une mauvaise réponse
    // - Soit donné trop ou pas assez de réponses
    return (
      ua.answers.some((a) => badAnswers.find((ba) => ba.emoji === a)) ||
      ua.answers.length !== goodAnswers.length
    )
  })
  let content = `## Résultat de la question du jour\n${validator.unescape(
    question.question
  )}\n\n`
  content += `### Bonnes réponses
    ${goodAnswers
      .map((a) => `${a.emoji} : ${validator.unescape(a.answer)}`)
      .join('\n')}
    `

  if (goodUsers.length) {
    content += `\n### Gagnant·e${goodUsers.length > 1 ? '·s' : ''}
    ${goodUsers.map((ua) => `<@${ua.providerAccountId}>`).join(' ')}
    `
  }

  if (badUsers.length) {
    content += `\n### Perdant·e${badUsers.length > 1 ? '·s' : ''}
    ${badUsers.map((ua) => `<@${ua.providerAccountId}>`).join(' ')}
    `
  }

  //Répondre au message
  const message = await channel.messages.fetch(dailyContests.messageId)
  if (!message) return console.error('Message not found')

  //Mettre à jour le portefeuille des utilisateurs
  const incrementValue = 50 * goodUsers.length
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
