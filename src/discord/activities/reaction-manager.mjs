import { DailyContests } from '../../models/daily-contests.mjs'
import {
  DISCORD_MESSAGE_TYPES,
  DiscordMessages,
} from '../../models/discord-messages.mjs'
import { db } from '../../utils/db.mjs'
import { dailyContestReaction } from '../commands/dailyContest/dailyContest.reaction.mjs'
import { carpoolingReaction } from '../commands/carpooling/carpooling.reaction.mjs'

/**
 * @description Lorsque l'utilisateur ajouté une réaction à un message
 *
 */
export async function reactionManager(reaction, user, type) {
  try {
    // Compléter les partials si nécessaire
    if (reaction.message.partial) await reaction.message.fetch()
    if (reaction.partial) await reaction.fetch()
    if (user.partial) await user.fetch()
  } catch (error) {
    console.error('Erreur lors de la récupération de la réaction:', error)
  }
  if (user.bot) return

  await db()

  const msg = await DiscordMessages.findOne({
    id: reaction.message.id,
  })

  if (msg) {
    if (msg.type === DISCORD_MESSAGE_TYPES.dailyContest) {
      dailyContestReaction(reaction, user, type)
    }
  } else {
    // Vérifier si c'est une réaction de covoiturage
    if (reaction.emoji.name === '🚗' && reaction.message.content.includes('Covoiturage créé par')) {
      carpoolingReaction(reaction, user)
    }
  }
  const dailyContest = await DailyContests.findOne({
    messageId: reaction.message.id,
  })

  if (!dailyContest) {
    console.error('Daily contest not found')
    return
  }
}
