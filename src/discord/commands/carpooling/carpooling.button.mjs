import { CarpoolingCustomId } from './carpooling.custom-id.mjs'
import { valhalla } from '../../../utils/valhalla.mjs'
import { ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js'
import { carpoolingCreate } from './carpooling.create.mjs'

const btn = {
  customId: CarpoolingCustomId.default,
  execute: async (interaction) => {
    const customId = interaction.customId

    if (customId === CarpoolingCustomId.create) {
      return await carpoolingCreate(interaction)
    }

    await interaction.deferUpdate()

    if (customId.startsWith(CarpoolingCustomId.link)) {
      const messageId = customId.replace(CarpoolingCustomId.link, '')
      await valhalla('midgarrd/carpool/join', interaction.user.id, {
        messageId,
        userId: interaction.user.id,
        name: interaction.user.username,
      })
    }

    // Rafraîchir l'affichage
    const startMessage = await interaction.channel.fetchStarterMessage()
    const search = startMessage.content.match(/http[s]?:\/\/[^ ]+/g)
    const url = search[0]
    const eventId = url.match(/\/([^/)]+)(?:\)|$)/)[1]

    const event = await valhalla(`midgarrd/events/${eventId}`, interaction.user.id)
    const carpooling = event?.carpooling || []

    let content = ''
    content += `**${event.title}**\n\n`
    content += '## Covoiturages\n\n'

    if (carpooling.length === 0) {
      content += 'Aucun covoiturage n\'a été créé pour cet événement.\n'
    } else {
      carpooling.forEach((carpool) => {
        const confirmed = carpool.participants.filter(p => p.status === 'confirmed')
        const pending = carpool.participants.filter(p => p.status === 'pending')

        content += `### Covoiturage de ${carpool.name}\n`
        content += `📍 ${carpool.address.label}\n`
        content += `🕒 ${new Date(carpool.date).toLocaleString()}\n`
        content += `🚗 Places disponibles : ${carpool.places - confirmed.length}\n\n`

        if (confirmed.length > 0) {
          content += '**Confirmés :**\n'
          confirmed.forEach(p => content += `- ${p.name}\n`)
        }

        if (pending.length > 0) {
          content += '\n**En attente :**\n'
          pending.forEach(p => content += `- ${p.name}\n`)
        }

        content += '\n'
      })
    }

    const rows = []

    // Bouton pour créer un nouveau covoiturage
    const createButton = new ButtonBuilder()
      .setCustomId(CarpoolingCustomId.create)
      .setLabel('Créer un covoiturage')
      .setStyle(ButtonStyle.Primary)

    rows.push(new ActionRowBuilder().addComponents(createButton))

    // Boutons pour les covoiturages existants
    if (carpooling.length > 0) {
      carpooling.forEach((carpool) => {
        const linkButton = new ButtonBuilder()
          .setCustomId(`${CarpoolingCustomId.link}${carpool.messageId}`)
          .setLabel(`Rejoindre le covoiturage de ${carpool.name}`)
          .setStyle(ButtonStyle.Secondary)

        rows.push(new ActionRowBuilder().addComponents(linkButton))
      })
    }

    await interaction.editReply({
      content,
      components: rows,
    })
  },
}

export default btn
