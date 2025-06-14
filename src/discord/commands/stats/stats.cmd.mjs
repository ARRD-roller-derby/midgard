import { MessageFlags, SlashCommandBuilder } from 'discord.js'
import { getResume, statsMenu } from './stats.utils.mjs'

const cmd = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Toutes les stats du ARRD.'),
  async execute(interaction) {
    const memberRoles = interaction.member.roles.cache
      .map((role) => role.name)
      .join(', ')

    if (!memberRoles.match(/bureau|dev/i)) {
      await interaction.reply({
        content: "Tu n'as pas les droits pour voir les stats.",
        flags: MessageFlags.Ephemeral,
      })
      return
    }

    await interaction.reply({
      content: await getResume(interaction),
      flags: MessageFlags.Ephemeral,
      components: statsMenu,
    })
  },
}

export default cmd
