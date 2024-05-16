/**
 * @description Lorsque l'utilisateur envoie un message dans un salon
 */
export async function postMessage(interaction, client) {
  // Eviter les boucles infinies, si le message est envoyé par un bot, on ne fait rien
  if (interaction.author.bot) return

  const channel = await client.channels.fetch(interaction.channelId)

  if (!channel) return

  // if (channel.name.match(/jmsx/)) return postMessageJmsx(interaction, client)
}
