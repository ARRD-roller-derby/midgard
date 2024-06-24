import { client } from '../../../index.mjs'
import { botAnswer } from './bot-answer.mjs'

/**
 * @description Lorsque l'utilisateur envoie un message dans un salon
 */
export async function postMessage(interaction) {
  // Eviter les boucles infinies, si le message est envoyé par un bot, on ne fait rien
  if (interaction.author.bot) return

  const channel = await client.channels.fetch(interaction.channelId)

  if (!channel) return

  const isBotMention = interaction?.mentions?.users?.has(
    process.env.DISCORD_CLIENT_ID
  )

  if (
    interaction?.mentions?.repliedUser?.id === process.env.DISCORD_CLIENT_ID ||
    isBotMention
  )
    botAnswer(interaction)
}
