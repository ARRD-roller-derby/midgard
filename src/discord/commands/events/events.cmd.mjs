import { MessageFlags, SlashCommandBuilder } from 'discord.js'

import { fetchEvents } from './events.utils.mjs'

const cmd = {
  data: new SlashCommandBuilder()
    .setName('events')
    .setDescription('Tous les évènements à venir !'),
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral })
    await fetchEvents(interaction)
  },
}

export default cmd
