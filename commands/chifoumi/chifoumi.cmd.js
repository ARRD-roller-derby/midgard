const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ButtonBuilder,
} = require('discord.js')
const { ChifoumiCustomId } = require('./chifoumi.custom-id')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('chifoumi')
    .setDescription('Joue au Chifoumi !! '),
  async execute(interaction) {
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(ChifoumiCustomId.stone)
        .setLabel('✊')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(ChifoumiCustomId.paper)
        .setLabel('✋')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId(ChifoumiCustomId.scissors)
        .setLabel('✌️')
        .setStyle(ButtonStyle.Secondary)
    )

    await interaction.reply({
      content: `Fais ton choix ! 🤔`,
      ephemeral: true,
      components: [row],
    })
  },
}
