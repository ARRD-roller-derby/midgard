const { carpool } = require('./carpool')

/**
 * @description Lorsque l'utilisateur envoie un message dans un salon
 */
async function postMessage(interaction) {
  // Eviter les boucles infinies, si le message est envoyé par un bot, on ne fait rien
  if (interaction.author.bot) return

  // on ne cherche pas dans les réponses à un message ou dans un fil de discussion
  if (interaction.content.match(/covoit/) && !interaction.reference)
    carpool(interaction)
}

module.exports = {
  postMessage,
}
