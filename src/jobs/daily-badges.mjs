import { client } from '../../index.mjs'
import { valhalla } from '../utils/valhalla.mjs'

const emojiMedal = {
  or: '🥇',
  argent: '🥈',
  bronze: '🥉',
}
//for dev
let start = false
export async function dailyBadges() {
  //  if (start) return
  console.log('🚀 Lancement de la tâche DAILY CONTEST')

  const channel = client.channels.cache.get(process.env.CHANNEL_BLABLA_ID)

  if (!channel) {
    console.error('Channel not found')
    return
  }

  start = true

  console.log('🚀 Lancement de la tâche DAILY BADGES', new Date())
  try {
    const { dailyBadges } = await valhalla(
      '/midgarrd/badges/hall_of_fame',
      '',
      {}
    )

    if (!dailyBadges || dailyBadges.length === 0) return

    let content = `## Badges débloqués aujourd'hui\n\n`
    dailyBadges.forEach((user) => {
      content += `<@${user.providerAccountId}>\n`

      user.badges
        .sort((a, b) => {
          return a === 'or' ? -1 : b === 'or' ? 1 : 0
        })
        .forEach((badge) => {
          content += `**${emojiMedal[badge.level]}** : ${badge.name}\n`
        })
      content += '\n'
    })

    const MAX_DESCRIPTION_LENGTH = 1700
    if (content.length > MAX_DESCRIPTION_LENGTH) {
      const formattedContent = content.split('\n')
      let tempContent = ''
      let i = 0
      while (tempContent.length < MAX_DESCRIPTION_LENGTH) {
        tempContent += formattedContent[i] + '\n'
        i++
      }
      await channel.send({ content: tempContent })
      content = formattedContent.slice(i).join('\n')
    }
    await channel.send({ content })
  } catch (e) {
    console.error(e)
  }
}
