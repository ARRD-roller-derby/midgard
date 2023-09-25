// constants
const { CarpoolCustomId } = require('./carpool.custom-id')
const { CHANNEL_BLABLA_ID, DISCORD_GUILD_ID } = require('../../utils/constants')

// Utils
const { valhalla } = require('../../utils/valhalla')
const { getMembers } = require('../../helpers/get_members')
const { textDate } = require('../../utils/text-date')

module.exports = {
  customId: CarpoolCustomId.create,
  execute: async (interaction) => {
    await interaction.deferUpdate()

    const client = interaction.client
    const channel = client.channels.cache.get(CHANNEL_BLABLA_ID)

    if (!channel) return console.error("Le canal spécifié n'a pas été trouvé.")

    const event = await valhalla('events/carpool', interaction.user.id)
    if (!event) return

    const presentMembers = event.participants
      .filter((p) => p.status === 'présent')
      .map((p) => p.name)

    const guild = client.guilds.cache.get(DISCORD_GUILD_ID)

    if (!guild) {
      return console.error(
        "L'interaction ne provient pas d'un serveur (guild)."
      )
    }

    // Récupérez les membres du serveur (guild)
    const resMembers = await getMembers(client)
    const members = resMembers
      .filter(
        (m) =>
          presentMembers.includes(m.username) ||
          presentMembers.includes(m.nickname)
      )
      .map((m) => `<@${m.id}>`)

      .join(', ')

    const name = `${
      interaction.user.nickname || interaction.user.username
    } cherche un covoiturage pour ${textDate(event)}`
    console.log(members)
    const thread = await channel.threads.create({
      name,
      autoArchiveDuration: 60 * 24,
      reason: name,
    })

    await thread.send(`Je tag les présents : ${members}`)

    await interaction.editReply({
      content: 'Le fil est créé !',
    })
  },
}
