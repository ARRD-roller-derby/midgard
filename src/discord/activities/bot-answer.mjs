import { EmbedBuilder, AttachmentBuilder } from 'discord.js'
import { openai } from '../../utils/ai.mjs'
import {
  DISCORD_MESSAGE_TYPES,
  DiscordMessages,
} from '../../models/discord-messages.mjs'
import { db } from '../../utils/db.mjs'
import { Users } from '../../models/users.mjs'
import { getResume } from '../../utils/get-resume.mjs'

const defaultsResponses = [
  '죄송해 (désolée), je ne comprends pas encore assez bien le français pour te répondre. Je vais revoir la liste des commandes disponibles.',
  '음... (Hmm), je ne suis pas encore super en français. Tu pourrais vérifier la liste des commandes disponibles ?',
  "아이고 (Oh là là), mon français n'est pas encore au point. Je vais jeter un coup d'œil aux commandes pour mieux comprendre.",
  "미안해 (désolée), je suis encore en train d'apprendre le français. Je vais vérifier les commandes et interactions possibles.",
  '죄송해 (désolée), je ne maîtrise pas encore assez bien le français pour comprendre ça. Tu peux consulter la liste des commandes ?',
  "미안해 (désolée), mon français est encore en cours d'apprentissage. Je vais revoir les commandes disponibles.",
  "아, 죄송해 (désolée) ! Mon français est encore en progrès. Je vais voir la liste des commandes pour t'aider.",
  "미안해 (excuse-moi), je ne suis pas encore très à l'aise avec le français. Je vais vérifier les commandes possibles.",
  '미안해 (désolée), mais je ne comprends pas encore bien le français. Je vais regarder les commandes et interactions disponibles.',
  '죄송해 (désolée), je ne suis pas encore fluide en français. Je vais voir la liste des commandes pour mieux répondre.',
  "미안해 (désolée), je n'ai pas encore compris cette question. Je vais revoir les commandes disponibles.",
  "음... (Hmm), je suis encore en train d'apprendre le français. Peux-tu vérifier la liste des commandes ?",
  "아이고 (Oh là là), je ne suis pas encore à l'aise avec le français. Je vais regarder les commandes pour mieux comprendre.",
  "죄송해 (désolée), mon français est encore en apprentissage. Je vais jeter un coup d'œil aux commandes.",
  '미안해 (désolée), je ne comprends pas encore bien le français. Pourrais-tu consulter la liste des commandes ?',
  '아, 미안해 (désolée), je dois encore améliorer mon français. Je vais vérifier les commandes disponibles.',
  "죄송해 (désolée), je suis encore en train d'apprendre. Tu peux consulter la liste des commandes ?",
  "미안해 (désolée), mon français n'est pas encore parfait. Je vais revoir les commandes pour mieux t'aider.",
]

const commands = [
  {
    name: '/stats',
    value:
      'Uniquement pour le bureau, cette commande permet de voir les taux de présences et de télécharger une feuille Excel.',
  },
  {
    name: '/rules [termes à rechercher]',
    value:
      "Utilisez cette commande pour consulter une règle officielle en un clin d'œil !",
  },
  {
    name: '/events',
    value:
      "Naviguez d'un événement à l'autre et indiquez même votre présence !",
  },
]

export async function botAnswer(interaction) {
  const reply = interaction.content
  const authorId = interaction.author.id
  const messageId = interaction?.reference?.messageId
  const randomIndex = Math.floor(Math.random() * defaultsResponses.length)
  const response = defaultsResponses[randomIndex]

  const baseMsg = await interaction.channel.messages.fetch(messageId)
  let instructions = ''

  const cmdEmbed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle('Mes commandes')
    .addFields(commands)

  if (
    baseMsg &&
    // baseMsg?.content?.includes('Question du jour') &&
    baseMsg.content.includes('Réponse à 19h')
  ) {
    return await interaction.reply({
      content: response + '\n\n----',
      embeds: [cmdEmbed],
    })
  }

  await db()
  const existingMessage = await DiscordMessages.findOne({
    messageId,
  })

  let content = ''

  const user = await Users.findOne({
    providerAccountId: authorId,
  })

  if (user.wallet < 50) {
    content = response

    content += '\n\n----'
    return await interaction.reply({
      content: content,
      embeds: [cmdEmbed],
    })
  }

  user.wallet -= 50
  await user.save()
  if (!existingMessage) {
    instructions = baseMsg.content
    const thread = await openai.beta.threads.create()

    await DiscordMessages.create({
      id: messageId,
      createdAt: new Date(),
      type: DISCORD_MESSAGE_TYPES.chatGpt,
      threadId: thread.id,
      messageId,
    })
  }

  const savedMsg = await DiscordMessages.findOne({
    messageId,
  })

  try {
    instructions += reply
    await openai.beta.threads.runs.createAndPoll(savedMsg.threadId, {
      assistant_id: process.env.CHAT_GPT_ASSISTANT_ID,
      instructions,
      max_completion_tokens: 700,
    })

    const messages = await openai.beta.threads.messages.list(savedMsg.threadId)
    const lastMessage = messages.data.pop()

    if (!lastMessage) {
      const randomIndex = Math.floor(Math.random() * defaultsResponses.length)
      const response = defaultsResponses[randomIndex]

      content = response

      return await interaction.reply({
        content: content,
        embeds: [cmdEmbed],
      })
    }

    content = lastMessage.content.map((c) => c?.text?.value).join('')

    const MAX_DESCRIPTION_LENGTH = 1700

    if (content.length > MAX_DESCRIPTION_LENGTH) {
      const formattedDescription = content
        .split('. ')
        .map((line) => line.trim())
        .join('.\n')
      const buffer = Buffer.from(formattedDescription, 'utf-8')
      const attachment = new AttachmentBuilder(buffer, { name: 'réponse.md' })

      return await interaction.reply({
        content: getResume(content, 1500) + '---\n\n',
        files: [attachment],
      })
    } else {
      return await interaction.reply({
        content: content,
      })
    }
  } catch (error) {
    console.error(error)

    // Handle errors gracefully by sending a default response
    return await interaction.reply({
      content:
        '미안해 (désolée), il y a eu un problème. Je vais vérifier les commandes disponibles.',
      embeds: [cmdEmbed],
    })
  }
}
