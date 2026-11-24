import { DailyContests } from '../../../models/daily-contests.mjs'
import { db } from '../../../utils/db.mjs'

/**
 *
 * @param {*} interaction
 * @param {*} reaction
 * @param {String } type - add or remove
 * @returns
 */
export async function dailyContestReaction(interaction, user, type) {
  if (user.bot) return

  const providerAccountId = user.id
  const messageId = interaction.message.id
  const emoji = interaction.emoji.name

  await db()

  if (type === 'add') {
    const result = await DailyContests.updateOne(
      { messageId, 'userAnswers.providerAccountId': providerAccountId },
      { $addToSet: { 'userAnswers.$.answers': emoji } }
    )
    if (!result.matchedCount) {
      const inserted = await DailyContests.updateOne(
        { messageId, 'userAnswers.providerAccountId': { $ne: providerAccountId } },
        { $push: { userAnswers: { providerAccountId, answers: [emoji] } } }
      )
      // Another event may have created the participant in the meantime.
      if (!inserted.matchedCount) {
        await DailyContests.updateOne(
          { messageId, 'userAnswers.providerAccountId': providerAccountId },
          { $addToSet: { 'userAnswers.$.answers': emoji } }
        )
      }
    }
  } else {
    await DailyContests.updateOne(
      { messageId, 'userAnswers.providerAccountId': providerAccountId },
      { $pull: { 'userAnswers.$.answers': emoji } }
    )
  }
}
