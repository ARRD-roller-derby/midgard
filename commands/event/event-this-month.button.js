const { EmbedBuilder } = require('discord.js')
const { EventsCustomId } = require('./events.custom-id')
const dayjs = require('dayjs')
const { EventType } = require('./event-type')
const { Colors } = require('../../helpers/colors')
const { valhalla } = require('../../utils/valhalla')
const { getUserRoles } = require('../../helpers/get-user-roles')
const { tiptapJsonToMd } = require('../../helpers/tiptap-json-to-md')
const { VALHALLA_URL } = require('../../utils/constants')

module.exports = {
  customId: EventsCustomId.thisMonth,
  execute: async (interaction) => {
    await interaction.deferUpdate()

    const res = await valhalla('events/this-month', interaction.user.id, {
      roles: getUserRoles(interaction),
    })

    const events = res.events || []

    if (!events.length) {
      await interaction.editReply({
        ephemeral: true,
        content: 'Aucun événement ce mois-ci',
      })
      return
    }
    const eventListEmbed = new EmbedBuilder()

      .setColor(Colors.greenDark)
      .setTitle('Cette semaine')
      .setDescription(
        `${events.length} événement${events.length > 1 ? 's' : ''}
        ___`
      )
      .addFields(
        events.map((event) => ({
          name: event.title || EventType?.[event.type],
          value: `
          __${dayjs(event.start).format('HH:mm')} à ${dayjs(event.end).format(
            'HH:mm'
          )}__
          ${
            event.description
              ? '```' + tiptapJsonToMd(event.description.content) + '```'
              : ''
          }
          *Voir sur [Valhalla](${VALHALLA_URL}/agenda/${event._id})*
          ___`,
        }))
      )
      .setTimestamp()

    await interaction.editReply({
      ephemeral: true,
      embeds: [eventListEmbed],
    })
  },
}
