import dayjs from 'dayjs'
import { Events } from '../../../models/event.mjs'
import { db } from '../../../utils/db.mjs'
import { getMembers } from '../../../utils/get_members.mjs'
import { Users } from '../../../models/users.mjs'
import { AttachmentBuilder } from 'discord.js'

export async function statsPresence() {
  await db()

  // Les events des ces 2 derniers mois
  const monthEvents = await Events.find({
    start: {
      $gte: dayjs().startOf('day').subtract(2, 'month').toISOString(),
      $lt: dayjs().endOf('month').toISOString(),
    },
    cancelled: false,
  }).select('type participants')

  const events = monthEvents.map((event) => ({
    type: event.type,
    participants: event.participants,
  }))

  const _users = await Users.find({})
  const members = await getMembers()

  const users = _users
    .map((user) => {
      const member = members.find((m) => m.id === user.providerAccountId)
      return {
        name: member?.username || member?.globalName || user.name,
        id: user._id.toString(),
        bot: member?.bot,
        roles: member?.roles,
      }
    })
    .filter((user) => !user.bot && user.roles.includes('Membre'))

  // Calculer les taux de présence
  const totalEvents = events.length
  const eventTypes = [...new Set(events.map((event) => event.type))]

  const totalByType = eventTypes.reduce((acc, type) => {
    acc[type] = events.filter((event) => event.type === type).length
    return acc
  }, {})

  const userParticipationByType = users.reduce((acc, user) => {
    acc[user.id] = eventTypes.reduce((typeAcc, type) => {
      typeAcc[type] = events.filter(
        (event) =>
          event.type === type &&
          event.participants.some(
            (p) => p.userId === user.id && p.status === 'présent'
          )
      ).length
      return typeAcc
    }, {})
    return acc
  }, {})

  const presences = users.map((user) => {
    const userEvents = events.filter((event) =>
      event.participants.some(
        (p) => p.userId === user.id && p.status === 'présent'
      )
    )

    const totalUserEvents = userEvents.length

    const presences = eventTypes.reduce((acc, type) => {
      const userParticipations = userParticipationByType[user.id][type]
      const totalTypeEvents = totalByType[type]
      acc[type] = {
        count: userParticipations,
        percent: (userParticipations / totalTypeEvents) * 100,
      }
      return acc
    }, {})

    return {
      user,
      totalPresence: (totalUserEvents / totalEvents) * 100,
      presences,
    }
  })

  // Fonction pour convertir les données en CSV
  const convertToCSV = (data) => {
    const headers = [
      'Name',
      'Total Presence',
      ...eventTypes.map((type) => `Presence ${type}`),
    ]
    const rows = data.map((presence) => {
      const row = [
        presence.user.name,
        presence.totalPresence.toFixed(2),
        ...eventTypes.map((type) =>
          presence.presences[type].percent
            ? presence.presences[type].percent.toFixed(2)
            : '0.00'
        ),
      ]
      return row.join(',')
    })

    return [headers.join(','), ...rows].join('\n')
  }

  const csvData = convertToCSV(presences)

  return {
    attachment: new AttachmentBuilder(Buffer.from(csvData, 'utf-8'), {
      name: 'presences.csv',
    }),
    content:
      '## Présence aux entraînements (derby & patin)\n' +
      presences
        .map(({ presences, user }) => {
          const combinedPresence =
            presences['Cours de patinage'].count +
            presences['Entraînement de derby'].count

          const totalCombinedEvents = events.filter(({ type }) =>
            type.match(/Cours de patinage|Entraînement de derby/)
          ).length

          const percent = (combinedPresence / totalCombinedEvents) * 100
          return {
            percent,
            name: user.name,
          }
        })
        .sort((a, b) => b.percent - a.percent)
        .map(({ name, percent }) => `\n- ${percent.toFixed(0)}% **${name}**`)
        .join(''),
  }
}
