const { CarpoolCustomId } = require('./carpool.custom-id')

module.exports = {
  customId: CarpoolCustomId.cancel,
  execute: async (interaction) => {
    await interaction.deferUpdate()

    await interaction.deleteReply()
  },
}
