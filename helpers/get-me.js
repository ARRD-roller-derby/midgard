const { valhalla } = require('../utils/valhalla')

async function getMe(interaction) {
  return await valhalla('users/me', interaction.user.id)
}

module.exports = { getMe }
