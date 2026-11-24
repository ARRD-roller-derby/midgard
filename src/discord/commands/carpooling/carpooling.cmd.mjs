import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ButtonBuilder,
  MessageFlags,
} from 'discord.js'

import { CarpoolingCustomId } from './carpooling.custom-id.mjs'
import { valhalla } from '../../../utils/valhalla.mjs'

function formatAddress(address) {
  if (!address.label) return address.label

  // Si l'adresse contient "google" et "maps" mais pas de @, on reconstruit l'URL
  if (address.label.toLowerCase().includes('google') &&
    address.label.toLowerCase().includes('maps') &&
    !address.label.includes('@')) {
    const { lat, lon } = address
    return `https://www.google.com/maps?q=${lat},${lon}`
  }

  return address.label
}

const cmd = {
  data: new SlashCommandBuilder()
    .setName('covoit')
    .setDescription('gérer les covoiturages'),
  async execute(interaction) {
    try {
      await interaction.deferReply({ flags: MessageFlags.Ephemeral })

      if (!interaction.channel) {
        await interaction.editReply({
          content: 'Impossible d\'accéder au canal. Veuillez réessayer.',
        })
        return
      }

      if (!interaction.channel.isThread()) {
        await interaction.editReply({
          content: 'Cette commande ne peut être utilisée que dans un thread d\'un évènement',
        })
        return
      }

      const startMessage = await interaction.channel.fetchStarterMessage()
      const search = startMessage.content.match(/http[s]?:\/\/[^ ]+/g)
      if (!search || search.length === 0) {
        await interaction.editReply({
          content: 'Impossible de trouver l\'URL de l\'événement dans le message initial',
        })
        return
      }

      const url = search[0]
      const eventId = url.match(/\/([^/)]+)(?:\)|$)/)?.[1]
      if (!eventId) {
        await interaction.editReply({
          content: 'Impossible de trouver l\'ID de l\'événement dans l\'URL',
        })
        return
      }

      const event = await valhalla(`midgarrd/events/${eventId}`, interaction.user.id)

      if (!event) {
        await interaction.editReply({
          content: 'Cet évènement n\'existe pas',
        })
        return
      }

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

          content += `### Covoiturage de ${carpool?.name}\n`
          content += `📍 ${formatAddress(carpool.address)}\n`
          content += `🕒 ${new Date(carpool.date).toLocaleString()}\n`
          content += `🚗 Places disponibles : ${carpool.places - confirmed.length}\n`
          content += `🔗 [Voir le message](https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${carpool.messageId})\n\n`

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

      await interaction.editReply({
        content,
        components: rows,
      })
    } catch (error) {
      console.error('Erreur lors de l\'exécution de la commande covoiturage:', error)
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: 'Une erreur est survenue lors de l\'exécution de la commande.',
          flags: MessageFlags.Ephemeral,
        })
      } else {
        await interaction.editReply({
          content: 'Une erreur est survenue lors de l\'exécution de la commande.',
        })
      }
    }
  },
}

export default cmd
