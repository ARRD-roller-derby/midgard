import { client } from '../../index.mjs'

export async function getMembers() {
  const guild = await client.guilds.fetch(
    /*process.env.DISCORD_GUILD_ID */ '1085566649425473556'
  )
  const members = await guild.members.fetch() // returns Collection
  return members.map((member) => ({
    ...member.user,
    roles: member.roles.cache.map((role) => role.name),
    nickname: member.nickname,
  }))
}
