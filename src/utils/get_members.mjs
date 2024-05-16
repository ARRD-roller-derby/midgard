export async function getMembers(client) {
  const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID)
  const members = await guild.members.fetch() // returns Collection
  return members.map((member) => ({
    ...member.user,
    nickname: member.nickname,
  }))
}
