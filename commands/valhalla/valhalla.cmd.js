const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { Colors } = require('../../helpers/colors')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('valhalla')
    .setDescription('Accédez à Valhalla !'),
  async execute(interaction) {
    const meEmbed = new EmbedBuilder()
      .setColor(Colors.green)
      .setTitle('Valhalla')
      .setThumbnail('https://valhalla.arrd.fr/static/images/valhalla.png')
      .setDescription('Accédez à Valhalla !')
      .setURL('https://valhalla.arrd.fr/')
      .setTimestamp()

    await interaction.reply({
      embeds: [meEmbed],
      ephemeral: true,
    })
  },
}
