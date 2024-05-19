import { statsCustomId } from './stats.customId.mjs'
import { statsPresence } from './stats.presence.mjs'
import { getResume } from './stats.utils.mjs'

const btn = {
  customId: statsCustomId.btn.default,
  execute: async (interaction) => {
    await interaction.deferUpdate()

    const body = {
      content: '',
    }

    const customId = interaction.customId

    let content = ''
    if (customId === statsCustomId.btn.home) {
      content = await getResume(interaction)
      delete body.files
    }

    if (customId === statsCustomId.btn.presence) {
      const res = await statsPresence(interaction)
      body.content = res.content
      body.files = [res.attachment]
    }

    await interaction.editReply(body)
  },
}

export default btn
