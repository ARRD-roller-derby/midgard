import { SlashCommandBuilder } from 'discord.js'

import { getHomeDeath } from './death.utils.mjs'

const cmd = {
  data: new SlashCommandBuilder()
    .setName('death')
    .setDescription("Répond aux questions jusqu'à la mort ! ⚰️"),
  async execute(interaction) {
    await interaction.reply(await getHomeDeath(interaction))
  },
}

export default cmd
