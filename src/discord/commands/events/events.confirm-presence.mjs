import { valhalla } from '../../../utils/valhalla.mjs'
import { eventsCustomId } from './events.customId.mjs'

export async function eventsconfirmPresence(interaction) {
  const customId = interaction.customId
  const [_, _e, _type, status, eventId] = customId
    .replace(eventsCustomId.btn, '')
    .split('-')

  await valhalla(`events/participation-status`, interaction.user.id, {
    eventId,
    status,
  })
}
