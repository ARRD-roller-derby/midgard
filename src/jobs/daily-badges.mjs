import { client } from '../../index.mjs'
import { Badges } from '../models/badges.mjs'
import { UserBadges } from '../models/user_badges.mjs'
import { db } from '../utils/db.mjs'

const emojiMedal = {
  'safe-skills-1': '🥚',
  'safe-skills-2': '🐣',
  'safe-skills-3': '🐦',
  'roue-jaune': '🟡',
  'roue-verte': '🟢',
  'roue-bleue': '🔵',
  advanced: '🐉',
  'vie-asso': '🎲',
}

//for dev
let start = false
export async function dailyBadges() {
  // if (start) return
  console.log('🚀 Lancement de la tâche DAILY CONTEST')

  const channel = client.channels.cache.get(process.env.CHANNEL_BLABLA_ID)

  if (!channel) {
    console.error('Channel not found')
    return
  }

  start = true

  await db()

  console.log('🚀 Lancement de la tâche DAILY BADGES', new Date())
  try {
    const userBadges = await UserBadges.find({
      announcementDate: null,
    })

    const badges = await Badges.find({
      _id: {
        $in: userBadges.map((ub) => ub.badgeId),
      },
    })

    const dailyBadges = userBadges.reduce((acc, userBadge) => {
      const index = acc.findIndex(
        (user) => user.providerAccountId === userBadge.providerAccountId
      )

      const badge = badges.find(
        (badge) => badge._id.toString() === userBadge.badgeId.toString()
      )
      if (index !== -1) {
        acc[index].badges.push({
          level: badge.level,
          name: badge.name,
        })
        return acc
      } else {
        acc.push({
          providerAccountId: userBadge.providerAccountId,
          badges: [
            {
              level: badge.level,
              name: badge.name,
            },
          ],
        })
      }
      return acc
    }, [])

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
      if (tempContent.length > 0) await channel.send({ content: tempContent })
      content = formattedContent.slice(i).join('\n')
    } else {
      if (content.length > 0) await channel.send({ content })
    }

    await UserBadges.updateMany(
      {
        providerAccountId: {
          $in: dailyBadges.map((db) => db.providerAccountId),
        },
      },
      {
        announcementDate: new Date(),
      }
    )
  } catch (e) {
    console.error(e)
  }
}
