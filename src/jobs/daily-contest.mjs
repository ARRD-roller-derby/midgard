import { DailyContests } from '../models/daily-contests.mjs'
import { Questions } from '../models/questions.mjs'
import { db } from '../utils/db.mjs'
import Canvas from '@napi-rs/canvas'
import validator from 'validator'
import {
  DISCORD_MESSAGE_TYPES,
  DiscordMessages,
} from '../models/discord-messages.mjs'
import { AttachmentBuilder } from 'discord.js'
import { client } from '../../index.mjs'
import { emojis } from '../utils/emojis.mjs'

//pour le développement
let start = false

export async function dailyContest() {
  // if (start) return
  console.log('🚀 Lancement de la tâche DAILY CONTEST')

  const channel = client.channels.cache.get(process.env.CHANNEL_BLABLA_ID)

  if (!channel) {
    console.error('Channel not found')
    return
  }

  start = true

  await db()

  const oneWeekAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000)
  const dailyContests = await DailyContests.find({
    updatedAt: {
      $gte: oneWeekAgo,
    },
  })

  const usedQuestionIds = dailyContests.map((dc) => dc.questionId.toString())
  console.log(`Used Question IDs: ${usedQuestionIds}`)

  const questions = await Questions.find({
    status: {
      $ne: 'draft',
    },
  })
  console.log(`Total Questions in DB: ${questions.length}`)

  const filteredQuestions = questions.filter(
    (q) => !usedQuestionIds.includes(q._id.toString())
  )

  console.log(`Filtered Questions Count: ${filteredQuestions.length}`)

  if (filteredQuestions.length === 0) {
    console.log(
      'Aucune question disponible qui n’a pas été utilisée la semaine dernière.'
    )
    start = false
    return
  }

  const question =
    filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)]
  console.log(`Selected Question ID: ${question._id}`)

  const randomAnswers = question.answers.sort(() => Math.random() - 0.5)

  const answers = randomAnswers.map((answer, idx) => ({
    isGood: false,
    answerId: answer._id,
    emoji: emojis[idx],
  }))

  let content = `## Question du jour
  
  ${validator.unescape(question.question)}

`

  answers.forEach((answer) => {
    content += `**${answer.emoji} :** ${validator.unescape(
      question.answers.find((a) => a._id === answer.answerId).answer || ''
    )}\n`
  })

  content += `\n------------------------`
  content +=
    "\nRéagissez avec l'**emoji** correspondant à la/les bonne(s) réponse(s)."
  content += `\n*Réponse à 19h45*`
  content += `\n------------------------`
  content += `\n⚠️ Les émojis sont réinitialisés toutes les 15 minutes. Les émojis 3️⃣, 2️⃣, 1️⃣, 0️⃣ apparaîtront environ 30 secondes avant la réinitialisation. Si vous voyez le compte à rebours, attendez avant de répondre pour sélectionner tous vos choix. ⚠️`
  content += `\n------------------------`

  const body = {
    content,
  }

  if (question.img) {
    const background = await Canvas.loadImage(question.img)
    const canvas = Canvas.createCanvas(background.width, background.height)
    const context = canvas.getContext('2d')
    context.drawImage(background, 0, 0)

    const attachment = new AttachmentBuilder(await canvas.encode('png'), {
      name: 'profile-image.png',
    })

    body.files = [attachment]
  }

  const msg = await channel.send(body)

  await DiscordMessages.create({
    id: msg.id,
    createdAt: new Date(),
    type: DISCORD_MESSAGE_TYPES.dailyContest,
  })

  await DailyContests.create({
    questionId: question._id,
    updatedAt: new Date(),
    answers,
    messageId: msg.id,
    userAnswers: [],
  })

  await Promise.all(
    answers.map((answer) => {
      return msg.react(answer.emoji)
    })
  )

  start = false
}
