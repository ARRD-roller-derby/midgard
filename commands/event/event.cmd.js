const { SlashCommandBuilder, ActionRowBuilder } = require('discord.js')
const { forAll } = require('./event-buttons')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('events')
    .setDescription('Les évènements à venir.'),
  async execute(interaction) {
    const row = new ActionRowBuilder()
    row.addComponents(...forAll)

    await interaction.reply({
      content: 'Toutes les commandes liées aux **évènements**.',
      components: row.components.length > 0 ? [row] : undefined,
      ephemeral: true,
    })
  },
}
