import { DailyContests } from '../../models/daily-contests.mjs'
import {
  DISCORD_MESSAGE_TYPES,
  DiscordMessages,
} from '../../models/discord-messages.mjs'
import { db } from '../../utils/db.mjs'
import { dailyContestReaction } from '../commands/dailyContest/dailyContest.reaction.mjs'

/**
 * @description Lorsque l'utilisateur ajouté une réaction à un message
 *
 */
export async function reactionManager(interaction, user, type) {
  try {
    // Compléter les partials si nécessaire
    if (interaction.message.partial) await reaction.message.fetch()
    if (interaction.partial) await reaction.fetch()
    if (!user.partial) await user.fetch()
  } catch (error) {
    console.error('Erreur lors de la récupération de la réaction:', error)
  }
  if (user.bot) return

  await db()

  const msg = await DiscordMessages.findOne({
    id: interaction.message.id,
  })

  if (msg) {
    if (msg.type === DISCORD_MESSAGE_TYPES.dailyContest)
      dailyContestReaction(interaction, user, type)
  } else {
    //Classique réaction
  }
  const dailyContest = await DailyContests.findOne({
    messageId: interaction.message.id,
  })

  if (!dailyContest) {
    console.error('Daily contest not found')
    return
  }
}
