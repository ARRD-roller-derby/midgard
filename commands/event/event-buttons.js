const { ButtonBuilder, ButtonStyle } = require('discord.js')
const { EventsCustomId } = require('./events.custom-id')

const forAll = [
  new ButtonBuilder()
    .setCustomId(EventsCustomId.thisWeek)
    .setLabel('Cette semaine')
    .setStyle(ButtonStyle.Primary),
  new ButtonBuilder()
    .setCustomId(EventsCustomId.thisMonth)
    .setLabel('Ce mois')
    .setStyle(ButtonStyle.Primary),
]

module.exports = {
  forAll,
}
