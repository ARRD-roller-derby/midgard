function getEmbedByTitle(interaction, title) {
  const embeds = interaction.message.embeds || []
  return embeds.find((embed) => embed?.data?.title === title)
}

module.exports = {
  getEmbedByTitle,
}
