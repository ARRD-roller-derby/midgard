import { dailyContestCustomId } from './dailyContest.custom-id.mjs'

const btn = {
  customId: dailyContestCustomId.button,
  execute: async (interaction) => {
    await interaction.deferUpdate()

  },
}

export default btn
