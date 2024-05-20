import { ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js'
import { valhalla } from '../../../utils/valhalla.mjs'
import { createPagination } from '../../utils.mjs'
import { eventsCustomId } from './events.customId.mjs'
import dayjs from 'dayjs'
import { jsonToMd } from '../../../utils/json-to-md.mjs'
import { getResume } from '../../../utils/get-resume.mjs'
import { AttachmentBuilder } from 'discord.js'

export const PARTICIPATION_TYPES = {
  coach: 'coach',
  'assist-coach': 'assist-coach',
  skater: 'patineur.euse',
  visitor: 'visiteur.euse / NSO',
  organizer: 'organisateur.trice',
  invite: 'invité.e',
  absent: 'absent.e',
}

function confirmPresenceRow(
  eventId,
  myPresence = {
    type: '',
    status: '',
  },
  page
) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`${eventsCustomId.btn.confirm}-${eventId}-${page}`)
      .setLabel('Présence confirmée')
      .setDisabled(myPresence.status === 'présent')
      .setStyle(
        myPresence.status === 'présent'
          ? ButtonStyle.Success
          : ButtonStyle.Secondary
      ),
    new ButtonBuilder()
      .setCustomId(`${eventsCustomId.btn.notConfirm}-${eventId}-${page}`)
      .setLabel('Présence non confirmée')
      .setDisabled(myPresence.status === 'absent')
      .setStyle(
        myPresence.status === 'à confirmer'
          ? ButtonStyle.Danger
          : ButtonStyle.Secondary
      )
  )
}

function createPresenceRow(
  eventId,
  eventType,
  myPresence = {
    type: '',
    status: '',
  },
  page
) {
  const presence = (type) =>
    myPresence.type === type && myPresence.status === 'présent'
      ? ButtonStyle.Success
      : ButtonStyle.Secondary

  const row = [
    {
      btn: new ButtonBuilder()
        .setCustomId(
          `${eventsCustomId.btn.presence}-${eventId}-${PARTICIPATION_TYPES.coach}-${page}`
        )
        .setLabel('coach')
        .setStyle(presence(PARTICIPATION_TYPES.coach)),
      type: [
        'Entraînement de derby',
        'Cours de patinage',
        'Scrimmage',
        'Bootcamp',
        'Match',
      ],
    },
    {
      btn: new ButtonBuilder()
        .setCustomId(
          `${eventsCustomId.btn.presence}-${eventId}-${'assist_coach'}-${page}`
        )
        .setLabel('assistant.e coach')
        .setStyle(presence(PARTICIPATION_TYPES['assist-coach'])),
      type: [
        'Entraînement de derby',
        'Cours de patinage',
        'Scrimmage',
        'Bootcamp',
        'Match',
        'Randonnée / Balade',
      ],
    },
    {
      btn: new ButtonBuilder()
        .setCustomId(
          `${eventsCustomId.btn.presence}-${eventId}-${PARTICIPATION_TYPES.skater}-${page}`
        )
        .setLabel('patineur.euse')
        .setStyle(presence(PARTICIPATION_TYPES.skater)),
      type: [
        'Entraînement de derby',
        'Cours de patinage',
        'Scrimmage',
        'Bootcamp',
        'Match',
        'Randonnée / Balade',
      ],
    },
    {
      btn: new ButtonBuilder()
        .setCustomId(
          `${eventsCustomId.btn.presence}-${eventId}-${PARTICIPATION_TYPES.visitor}-${page}`
        )
        .setLabel('visiteur.euse / NSO')
        .setStyle(presence(PARTICIPATION_TYPES.visitor)),
      type: [
        'Entraînement de derby',
        'Cours de patinage',
        'Scrimmage',
        'Bootcamp',
        'Match',
        'Randonnée / Balade',
      ],
    },
    {
      btn: new ButtonBuilder()
        .setCustomId(
          `${eventsCustomId.btn.presence}-${eventId}-${PARTICIPATION_TYPES.organizer}-${page}`
        )
        .setLabel('organisateur.trice')
        .setStyle(presence(PARTICIPATION_TYPES.organizer)),
      type: [
        'Événement',
        'En ligne',
        'Autre',
        'Assemblée générale',
        'Randonnée / Balade',
      ],
    },
    {
      btn: new ButtonBuilder()
        .setCustomId(
          `${eventsCustomId.btn.presence}-${eventId}-${PARTICIPATION_TYPES.invite}-${page}`
        )
        .setLabel('invité.e')
        .setStyle(presence(PARTICIPATION_TYPES.invite)),
      type: [
        'Événement',
        'En ligne',
        'Autre',
        'Assemblée générale',
        'Randonnée / Balade',
      ],
    },
    {
      btn: new ButtonBuilder()
        .setCustomId(
          `${eventsCustomId.btn.presence}-${eventId}-${PARTICIPATION_TYPES.absent}-${page}`
        )
        .setLabel('Absent.e')
        .setStyle(
          myPresence.status.match(/absent/)
            ? ButtonStyle.Danger
            : ButtonStyle.Secondary
        ),
    },
  ]

  return new ActionRowBuilder().addComponents(
    ...row
      .filter((r) => !r.type || r.type.includes(eventType))
      .map((r) => r.btn)
  )
}

export async function fetchEvents(interaction) {
  try {
    const events = await valhalla('events/next', interaction.user.id)
    const _page = interaction?.customId?.split('-').pop() || 1

    const getPage = () => {
      if (_page === 'first') return 1
      if (_page === 'last') return events.length
      return isNaN(parseInt(_page)) ? 1 : parseInt(_page)
    }

    const page = getPage()

    const event = events[page - 1]

    const myPresence = event?.participants?.find(
      (p) => p.providerAccountId === interaction.user.id
    ) || {
      type: '',
      status: '',
    }

    if (!event) {
      return await interaction.editReply({
        content: 'Aucun évènement prévu pour le moment.',
      })
    }

    let content = `## ${event.title}\n`
    const desc = jsonToMd(event?.description?.content || '')

    if (event.start) {
      content += `### ${dayjs(event.start).format('HH:mm')} à ${dayjs(
        event.end
      ).format('HH:mm')}\n`
    }

    if (event.description) {
      content += `${getResume(desc, 1500)}\n`
    }

    if (event.address) {
      content += `\n*${event.address.label}*\n`
    }

    // === Ajout des participants ===

    const numberOfParticipants = event.participants.filter(
      (p) => p.status === 'présent'
    ).length

    content += `### Participant${
      numberOfParticipants > 1 ? 's' : ''
    } (${numberOfParticipants})\n\n`
    content += event.participants
      .reduce((acc, p) => {
        const findType = acc.find((a) => a.type === p.type)
        if (findType) {
          findType.list.push(p)
        } else {
          acc.push({ type: p.type, list: [p] })
        }
        return acc
      }, [])
      .map((it) => `**${it.list.length}** ${it.type}`)
      .join(' - ')

    content += `\n\n`

    const body = {
      content,
      files: [],
      components: [
        createPagination(page, events.length, eventsCustomId.btn.pagination),
        event.cancelled
          ? new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId(
                  `${eventsCustomId.btn.info}-${event._id}-cancel-${page}`
                )
                .setLabel('Annulé')
                .setDisabled(true)
                .setStyle(ButtonStyle.Danger)
            )
          : createPresenceRow(event._id, event.type, myPresence, page),
        confirmPresenceRow(event._id, myPresence, page),
      ],
    }

    const participantsByStatus = event.participants.reduce((acc, p) => {
      if (!acc[p.status]) {
        acc[p.status] = {}
      }
      if (!acc[p.status][p.type]) {
        acc[p.status][p.type] = []
      }
      acc[p.status][p.type].push(p.name)
      return acc
    }, {})

    const participantText = Object.entries(participantsByStatus)
      .map(([status, types]) => {
        const typeText = Object.entries(types)
          .map(([type, names]) => {
            return `===============\n${
              names.length
            } ${type}\n===============\n${names
              .map((n) => `\n- ${n}`)
              .join(' ')}`
          })
          .join('\n\n')
        return `Total ${status}: ${
          Object.values(types).flat().length
        }\n\n${typeText}`
      })
      .join('\n\n')

    const buff = Buffer.from(participantText)
    body.files.push(new AttachmentBuilder(buff, { name: 'participants.txt' }))

    if (desc.length > 1500) {
      const buffer = Buffer.from(desc)
      const attachment = new AttachmentBuilder(buffer, { name: 'desc.txt' })
      body.files.push(attachment)
    }

    await interaction.editReply(body)
  } catch (e) {
    console.error(e)
    return await interaction.editReply({
      content: 'Impossible de récupérer les évènements.',
    })
  }
}
