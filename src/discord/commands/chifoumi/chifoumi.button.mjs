import { ChifoumiCustomId } from './chifoumi.custom-id.mjs'
import { EmbedBuilder } from 'discord.js'

const btn = {
  customId: ChifoumiCustomId.button,
  execute: async (interaction) => {
    await interaction.deferUpdate()

    const userChoice = interaction.customId.split('-')[2]

    const iaChoiceFn = () => {
      const choices = ['stone', 'paper', 'scissors']
      return choices[Math.floor(Math.random() * choices.length)]
    }
    const iaChoice = iaChoiceFn()

    const choiceEmoji = {
      stone: '✊',
      paper: '✋',
      scissors: '✌️',
    }

    const choices = {
      userChoice: choiceEmoji[userChoice],
      iaChoice: choiceEmoji[iaChoice],
    }

    const win = {
      result: 'Gagné',
      ...choices,
    }

    const loose = {
      result: 'Perdu',
      ...choices,
    }

    const fields = () => {
      if (userChoice === 'stone' && iaChoice === 'scissors') {
        return win
      }
      if (userChoice === 'stone' && iaChoice === 'paper') {
        return loose
      }
      if (userChoice === 'paper' && iaChoice === 'stone') {
        return win
      }
      if (userChoice === 'paper' && iaChoice === 'scissors') {
        return loose
      }
      if (userChoice === 'scissors' && iaChoice === 'paper') {
        return win
      }
      if (userChoice === 'scissors' && iaChoice === 'stone') {
        return loose
      }
      return {
        result: 'Egalité',
        ...choices,
      }
    }

    const fieldResult = fields()

    const resultEmbed = new EmbedBuilder()
      .setColor(0x2febbc)
      .setTitle(fieldResult.result)
      .addFields(
        {
          name: interaction.member.user.username,
          value: fieldResult.userChoice,
          inline: true,
        },
        {
          name: 'VS',
          value: '\b',
          inline: true,
        },
        { name: 'IA', value: fieldResult.iaChoice, inline: true }
      )

    await interaction.editReply({
      embeds: [resultEmbed],
    })
  },
}

export default btn
