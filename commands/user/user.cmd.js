const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { getMe } = require('../../helpers/get-me')
const { Colors } = require('../../helpers/colors')
const { getResume } = require('../../helpers/get-resume')

module.exports = {
  data: new SlashCommandBuilder().setName('me').setDescription('Mon profil.'),
  async execute(interaction) {
    const me = await getMe(interaction)
    const meEmbed = new EmbedBuilder()
      .setColor(Colors.green)
      .setTitle('Mon Profil')
      .setAuthor({
        name: me.name,
        iconURL: interaction.member.user.avatarURL(),
      })
      .addFields([
        { name: 'Porte-feuille', value: `${me.wallet} Dr.` },
        { name: 'N° Licence', value: `${me.options_nlicence}` },
        {
          name: 'Pôles',
          value: getResume(
            me.roles
              .map((role) => role.name)
              .filter((role) => role.toLowerCase() !== 'membre')
              .join(', '),
            1000
          ),
        },
      ])
      .setTimestamp()

    await interaction.reply({
      embeds: [meEmbed],
      ephemeral: true,
    })
  },
}
