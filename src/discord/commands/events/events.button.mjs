import { eventsconfirmPresence } from './events.confirm-presence.mjs'
import { eventsCustomId } from './events.customId.mjs'
import { eventsPresence } from './events.presence.mjs'
import { fetchEvents } from './events.utils.mjs'

const btn = {
  customId: eventsCustomId.btn.default,
  execute: async (interaction) => {
    await interaction.deferUpdate()
    const customId = interaction.customId

    if (customId.includes(eventsCustomId.btn.presence))
      await eventsPresence(interaction)

    if (
      customId.includes(eventsCustomId.btn.confirm) ||
      customId.includes(eventsCustomId.btn.notConfirm)
    )
      await eventsconfirmPresence(interaction)

    return await fetchEvents(interaction)
  },
}

export default btn
