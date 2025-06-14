import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  MessageFlags,
} from 'discord.js'
import { CarpoolingCustomId } from './carpooling.custom-id.mjs'

export async function carpoolingCreate(interaction) {
  try {
    const modal = new ModalBuilder()
      .setCustomId(CarpoolingCustomId.modal)
      .setTitle('Créer un covoiturage')

    // Champ pour le nombre de places
    const placesInput = new TextInputBuilder()
      .setCustomId('places')
      .setLabel('Places disponibles')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Ex: 3')
      .setRequired(true)
      .setMinLength(1)
      .setMaxLength(1)

    // Champ pour le lien Google Maps
    const addressInput = new TextInputBuilder()
      .setCustomId('address')
      .setLabel('Lien Google Maps')
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder('Collez le lien Google Maps du point de départ')
      .setRequired(true)

    // Champ pour la date (optionnel)
    const dateInput = new TextInputBuilder()
      .setCustomId('date')
      .setLabel('Date (optionnel)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('JJ/MM/AAAA - Date de l\'événement par défaut')
      .setRequired(false)
      .setMinLength(10)
      .setMaxLength(10)

    // Champ pour l'heure
    const timeInput = new TextInputBuilder()
      .setCustomId('time')
      .setLabel('Heure de départ')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('HH:mm')
      .setRequired(true)
      .setMinLength(5)
      .setMaxLength(5)


    // Ajout des champs à la modale
    const firstActionRow = new ActionRowBuilder().addComponents(placesInput)
    const secondActionRow = new ActionRowBuilder().addComponents(addressInput)
    const thirdActionRow = new ActionRowBuilder().addComponents(dateInput)
    const fourthActionRow = new ActionRowBuilder().addComponents(timeInput)

    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow)

    await interaction.showModal(modal)
  } catch (error) {
    console.error('Erreur lors de la création de la modale:', error)
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: 'Une erreur est survenue lors de la création du formulaire.',
        flags: MessageFlags.Ephemeral
      })
    }
  }
}