import { SlashCommandBuilder } from 'discord.js'

import { fetchEvents } from './events.utils.mjs'

const cmd = {
  data: new SlashCommandBuilder()
    .setName('events')
    .setDescription('Tous les évènements à venir !'),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true })
    await fetchEvents(interaction)
  },
}

export default cmd
