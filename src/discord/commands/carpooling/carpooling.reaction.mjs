import { valhalla } from '../../../utils/valhalla.mjs'

export async function carpoolingReaction(reaction, user) {
  // Ignorer les réactions du bot
  if (user.bot) return

  // Vérifier si c'est l'émoji de covoiturage
  if (reaction.emoji.name !== '🚗') return

  try {
    // Récupérer l'ID de l'événement depuis le thread
    const startMessage = await reaction.message.channel.fetchStarterMessage()
    const search = startMessage.content.match(/http[s]?:\/\/[^ ]+/g)
    const url = search[0]
    const eventId = url.match(/\/([^/)]+)(?:\)|$)/)[1]

    // Récupérer les informations du covoiturage
    const event = await valhalla(`midgarrd/events/${eventId}`, user.id)
    const carpool = event?.carpooling?.find(c => c.messageId === reaction.message.id)

    if (!carpool) {
      console.error('Covoiturage non trouvé pour le message:', reaction.message.id)
      return
    }

    // Vérifier si l'utilisateur est déjà participant
    const isParticipant = carpool.participants.some(p => p.userId === user.id)

    if (isParticipant) {
      // L'utilisateur retire sa réaction, on le retire du covoiturage
      await valhalla('midgarrd/carpool/leave', user.id, {
        eventId: eventId,
        messageId: reaction.message.id,
      })
    } else {
      // L'utilisateur ajoute sa réaction, on l'ajoute au covoiturage
      await valhalla('midgarrd/carpool/join', user.id, {
        eventId: eventId,
        messageId: reaction.message.id,
      })
    }

    // Mettre à jour le message
    const confirmed = carpool.participants.filter(p => p.status === 'confirmed')
    const pending = carpool.participants.filter(p => p.status === 'pending')
    const leader = carpool.participants.find(p => p.status === 'leader')

    let content = `🚗 **Covoiturage créé par ${leader?.name || ''}**\n` +
      `📍 ${carpool.address.label}\n` +
      `🕒 ${new Date(carpool.date).toLocaleString()}\n` +
      `👥 Places disponibles : ${carpool.places - confirmed.length}\n\n`

    if (confirmed.length > 0) {
      content += '**Confirmés :**\n'
      confirmed.forEach(p => content += `- ${p.name}\n`)
    }

    if (pending.length > 0) {
      content += '\n**En attente :**\n'
      pending.forEach(p => content += `- ${p.name}\n`)
    }

    content += '\nRéagissez avec 🚗 pour participer !'

    await reaction.message.edit(content)

  } catch (error) {
    console.error('Erreur lors du traitement de la réaction:', error)
  }
} 