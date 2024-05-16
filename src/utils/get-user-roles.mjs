export function getUserRoles(interaction) {
  const userRolesId = interaction.member._roles
  return interaction.guild.roles.cache.reduce((acc, role) => {
    acc[role.name] = userRolesId.includes(role.id)
    return acc
  }, {})
}
