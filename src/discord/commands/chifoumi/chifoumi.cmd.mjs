import {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonStyle,
  ButtonBuilder,
  MessageFlags,
} from 'discord.js'

import { ChifoumiCustomId } from './chifoumi.custom-id.mjs'

const cmd = {
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
      flags: MessageFlags.Ephemeral,
      components: [row],
    })
  },
}

export default cmd
