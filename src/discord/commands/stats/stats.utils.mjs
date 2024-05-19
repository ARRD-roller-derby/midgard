import { ButtonBuilder } from 'discord.js'
import { ActionRowBuilder, ButtonStyle } from 'discord.js'
import { statsCustomId } from './stats.customId.mjs'
import { db } from '../../../utils/db.mjs'
import { Events } from '../../../models/event.mjs'
import dayjs from 'dayjs'
import { getMembers } from '../../../utils/get_members.mjs'

const firstRow = new ActionRowBuilder().addComponents([
  new ButtonBuilder()
    .setCustomId(statsCustomId.btn.home)
    .setLabel('Accueil')
    .setStyle(ButtonStyle.Primary),
  new ButtonBuilder()
    .setCustomId(statsCustomId.btn.presence)
    .setLabel('Présence')
    .setStyle(ButtonStyle.Secondary),
])
export const statsMenu = [firstRow]

export async function getResume() {
  await db()

  const monthEvents = await Events.find({
    start: {
      //today
      $gte: dayjs().startOf('day').toISOString(),
      $lt: dayjs().endOf('month').toISOString(),
    },
  })

  const members = await getMembers()
  const derby = members.filter((m) => m.roles.includes('derby')).length
  const patin = members.filter(
    (m) => m.roles.includes('patin') && !m.roles.includes('derby')
  ).length
  const total = members.length

  return `
## Statistiques du serveur    
Nombre d'événements ce mois-ci: **${monthEvents.length}**

Nombre de membres: **${members.length}**
- derby: **${derby}** (soit ${((derby / total) * 100).toFixed(2)}%)
- patin: **${patin}** (soit ${((patin / total) * 100).toFixed(2)}%)

----
    `
}
