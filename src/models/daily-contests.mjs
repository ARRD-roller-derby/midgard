import pkg from 'mongoose'
const { Schema, model, models } = pkg

const Answer = new Schema({
  isGood: Boolean,
  answerId: String,
  emoji: String,
})

const UserAnswers = new Schema({
  providerAccountId: String,
  answers: [String],
})

export const DailyContests =
  models.daily_contests ||
  model(
    'daily_contests',
    new Schema({
      answers: [Answer],
      questionId: String,
      updatedAt: Date,
      messageId: String,
      userAnswers: [UserAnswers],
    })
  )
