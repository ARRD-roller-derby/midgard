import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ButtonBuilder,
  MessageFlags,
} from 'discord.js'

import { CarpoolingCustomId } from './carpooling.custom-id.mjs'
import { valhalla } from '../../../utils/valhalla.mjs'

const cmd = {
  data: new SlashCommandBuilder()
    .setName('covoit')
    .setDescription('gérer les covoiturages'),
  async execute(interaction, isUpdate = false) {

    try {
      if (!interaction.channel.isThread()) {
        await interaction.reply({
          content: 'Cette commande ne peut être utilisée que dans un thread d\'un évènement',
          flags: MessageFlags.Ephemeral,
        })
        return
      }

      await interaction.deferReply({ flags: MessageFlags.Ephemeral })
      const startMessage = await interaction.channel.fetchStarterMessage()
      const search = startMessage.content.match(/http[s]?:\/\/[^ ]+/g)
      if (!search || search.length === 0) {
        await interaction.reply({
          content: 'Impossible de trouver l\'URL de l\'événement dans le message initial',
          flags: MessageFlags.Ephemeral,
        })
        return
      }

      const url = search[0]
      const eventId = url.match(/\/([^/)]+)(?:\)|$)/)?.[1]
      if (!eventId) {
        await interaction.reply({
          content: 'Impossible de trouver l\'ID de l\'événement dans l\'URL',
          flags: MessageFlags.Ephemeral,
        })
        return
      }

      const event = await valhalla(`midgarrd/events/${eventId}`, interaction.user.id)

      if (!event) {
        await interaction.reply({
          content: 'Cet évènement n\'existe pas',
          flags: MessageFlags.Ephemeral,
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
          const leader = carpool.participants.find(p => p.status === 'leader')
          const confirmed = carpool.participants.filter(p => p.status === 'confirmed')
          const pending = carpool.participants.filter(p => p.status === 'pending')

          content += `### Covoiturage de ${leader?.name || 'Inconnu'}\n`
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
            .setLabel(`Rejoindre le covoiturage de ${carpool.participants.find(p => p.status === 'leader')?.name || 'Inconnu'}`)
            .setStyle(ButtonStyle.Secondary)

          rows.push(new ActionRowBuilder().addComponents(linkButton))
        })
      }

      if (isUpdate) {
        await interaction.editReply({
          content,
          components: rows,
        })
      } else {
        await interaction.reply({
          content,
          components: rows,
          flags: MessageFlags.Ephemeral,
        })
      }
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
