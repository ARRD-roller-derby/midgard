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

  const dailyContest = await DailyContests.findOne({
    messageId,
  })

  if (!dailyContest) return

  const userAnswer = dailyContest.userAnswers.find(
    (ua) => ua.providerAccountId === providerAccountId
  ) || {
    providerAccountId,
    answers: [],
  }

  if (type === 'add') {
    userAnswer.answers.push(emoji)
  } else {
    userAnswer.answers = userAnswer.answers.filter((a) => a !== emoji)
  }
  await DailyContests.findOneAndUpdate(
    { messageId },

    {
      userAnswers: [
        ...dailyContest.userAnswers.filter(
          (ua) => ua.providerAccountId !== providerAccountId
        ),
        userAnswer,
      ],
    }
  )
}
