const { EmbedBuilder, Colors } = require('discord.js')
const { openai } = require('../utils/ai')
const { valhalla } = require('../utils/valhalla')
const { carpool } = require('./carpool')

/**
 * @description Lorsque l'utilisateur envoie un message dans un salon
 */
async function postMessage(interaction) {
  // Eviter les boucles infinies, si le message est envoyé par un bot, on ne fait rien
  if (interaction.author.bot) return

  /*

  console.log(interaction.author.username, interaction.author.id)
  console.log(interaction.content)
  console.log(interaction.reference)
  console.log(interaction)

  */

  // on ne cherche pas dans les réponses à un message ou dans un fil de discussion
  if (interaction.content.match(/covoit/) && !interaction.reference)
    carpool(interaction)
  /*

  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: 'Say this is a test' }],
    model: 'gpt-3.5-turbo',
  })

  console.log(chatCompletion.choices)
*/
  //TODO à créer
}

module.exports = {
  postMessage,
}
