const { DISCORD_GUILD_ID } = require('../utils/constants')

async function getMembers(client) {
  const guild = await client.guilds.fetch(DISCORD_GUILD_ID)
  const members = await guild.members.fetch() // returns Collection
  return members.map((member) => member.user)
}

module.exports = { getMembers }
