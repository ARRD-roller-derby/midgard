import { valhalla } from '../../../utils/valhalla.mjs'
import { ButtonBuilder, ActionRowBuilder, ButtonStyle, MessageFlags } from 'discord.js'
import { CarpoolingCustomId } from './carpooling.custom-id.mjs'

const modal = {
  customId: CarpoolingCustomId.modal,
  execute: async (interaction) => {
    try {
      await interaction.deferReply({ ephemeral: true })

      const places = parseInt(interaction.fields.getTextInputValue('places'))
      const address = interaction.fields.getTextInputValue('address')
      const date = interaction.fields.getTextInputValue('date')
      const time = interaction.fields.getTextInputValue('time')

      if (isNaN(places) || places < 1 || places > 9) {
        await interaction.editReply({
          content: 'Le nombre de places doit être un chiffre entre 1 et 9.',
        })
        return
      }

      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
      if (!timeRegex.test(time)) {
        await interaction.editReply({
          content: 'Le format de l\'heure doit être HH:mm.',
        })
        return
      }

      // Coordonnées par défaut
      const DEFAULT_COORDS = {
        lat: 49.4412357,
        lon: 1.0911845,
        zoom: 11319
      }

      // Vérifier si c'est une URL Google Maps ou des coordonnées
      const isGoogleMapsUrl = address.includes('maps.app.goo.gl') || address.includes('google.com/maps')
      const coordMatch = address.match(/^(-?\d+\.\d+),(-?\d+\.\d+)(?:,\d+)?$/)

      let addressData = {
        label: address
      }

      if (isGoogleMapsUrl) {
        // Si c'est une URL Google Maps, on l'utilise directement
        addressData.url = address
      } else if (coordMatch) {
        // Si ce sont des coordonnées, on crée l'URL Google Maps
        const [_, lat, lon] = coordMatch
        addressData.url = `https://www.google.com/maps?q=${lat},${lon}`
      } else {
        // Si c'est juste un texte, on utilise les coordonnées par défaut
        addressData.url = `https://www.google.com/maps?q=${DEFAULT_COORDS.lat},${DEFAULT_COORDS.lon}&z=${DEFAULT_COORDS.zoom}`
      }

      // Récupération de l'ID de l'événement
      const startMessage = await interaction.channel.fetchStarterMessage()
      const search = startMessage.content.match(/http[s]?:\/\/[^ ]+/g)
      const url = search[0]
      const eventId = url.match(/\/([^/)]+)(?:\)|$)/)[1]

      // Récupération de l'événement pour sa date
      const event = await valhalla(`midgarrd/events/${eventId}`, interaction.user.id)
      if (!event) {
        await interaction.editReply({
          content: 'Impossible de récupérer les informations de l\'événement.',
        })
        return
      }

      let departureDate
      if (date) {
        // Si une date est fournie, on la valide
        const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/
        if (!dateRegex.test(date)) {
          await interaction.editReply({
            content: 'Le format de la date doit être JJ/MM/AAAA.',
          })
          return
        }

        const [day, month, year] = date.split('/')
        const [hours, minutes] = time.split(':')
        departureDate = new Date(year, month - 1, day, hours, minutes)
      } else {
        // Sinon on utilise la date de l'événement avec l'heure spécifiée
        const [hours, minutes] = time.split(':')
        departureDate = new Date(event.start)
        departureDate.setHours(parseInt(hours), parseInt(minutes))
      }

      // Créer d'abord le message avec l'émoji personnalisé
      const carpoolMessage = await interaction.channel.send({
        content: `🚗 **Covoiturage créé par ${interaction.user.username}**\n` +
          `📍 ${address}\n` +
          `🕒 ${departureDate.toLocaleString()}\n` +
          `👥 Places disponibles : ${places}\n\n` +
          `Réagissez avec 🚗 pour participer !`
      })

      // Ajouter l'émoji initial
      await carpoolMessage.react('🚗')

      // Créer le covoiturage avec le messageId déjà connu
      await valhalla('/midgarrd/carpool/create', interaction.user.id, {
        eventId,
        places,
        address: addressData,
        date: departureDate,
        userId: interaction.user.id,
        name: interaction.user.username,
        messageId: carpoolMessage.id
      })

      const updatedEvent = await valhalla(`midgarrd/events/${eventId}`, interaction.user.id)
      const carpooling = updatedEvent?.carpooling || []

      let content = ''
      content += `**${updatedEvent.title}**\n\n`
      content += '## Covoiturages\n\n'

      if (carpooling.length === 0) {
        content += 'Aucun covoiturage n\'a été créé pour cet événement.\n'
      } else {
        carpooling.forEach((carpool) => {
          const confirmed = carpool.participants.filter(p => p.status === 'confirmed')
          const pending = carpool.participants.filter(p => p.status === 'pending')

          content += `### Covoiturage de ${carpool?.name}\n`
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

      await interaction.editReply({
        content,
        components: rows,
      })
    } catch (error) {
      console.error('Erreur lors de la création du covoiturage:', error)
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: 'Une erreur est survenue lors de la création du covoiturage.',
          flags: MessageFlags.Ephemeral
        })
      } else {
        await interaction.editReply({
          content: 'Une erreur est survenue lors de la création du covoiturage.',
        })
      }
    }
  },
}

export default modal