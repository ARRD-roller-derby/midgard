import { valhalla } from '../../../utils/valhalla.mjs'
import { eventsCustomId } from './events.customId.mjs'

export async function eventsPresence(interaction) {
  const customId = interaction.customId
  const [_, eventId, _type, _page] = customId
    .replace(eventsCustomId.btn.presence, '')
    .split('-')
  const type = _type.replace('_', '-')

  await valhalla(`events/participation`, interaction.user.id, {
    eventId,
    participation: type,
    status: type.match(/absent/) ? 'absent' : 'present',
  })
}
