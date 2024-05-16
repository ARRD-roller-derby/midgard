import { dailyContestCustomId } from './dailyContest.custom-id.mjs'

const btn = {
  customId: dailyContestCustomId.button,
  execute: async (interaction) => {
    await interaction.deferUpdate()

    console.log(
      'dailyContest button clicked',
      interaction.user.id,
      interaction.customId
    )
  },
}

export default btn
