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

//for dev
let start = false

const emojis = ['🍉', '🍇', '🍌', '🍍', '🍎', '🍏', '🥥']

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

  const dailyContests = await DailyContests.find({
    updatedAt: {
      //Plus de 5j
      $lt: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000),
    },
  })

  const questions = await Questions.find({
    _id: {
      $nin: dailyContests.map((dc) => dc.questionId),
    },
  })

  const question = questions[Math.floor(Math.random() * questions.length)]

  const dailyContest = await DailyContests.find({
    questionId: question._id,
  })

  dailyContest.updatedAt = new Date()

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
  content += `\n*Réponse à 18h*`
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

  const isExist = await DailyContests.findOne({
    questionId: question._id,
  })

  // Référence le message pour le retrouver plus tard
  await DiscordMessages.create({
    id: msg.id,
    createdAt: new Date(),
    type: DISCORD_MESSAGE_TYPES.dailyContest,
  })

  if (!isExist) {
    await DailyContests.create({
      questionId: question._id,
      updatedAt: new Date(),
      answers,
      messageId: msg.id,
      userAnswers: [],
    })
  } else {
    await DailyContests.findOneAndUpdate(
      {
        questionId: question._id,
      },
      {
        updatedAt: new Date(),
        answers,
        messageId: msg.id,
        userAnswers: [],
      }
    )
  }

  await Promise.all(
    answers.map((answer) => {
      return msg.react(answer.emoji)
    })
  )
}
