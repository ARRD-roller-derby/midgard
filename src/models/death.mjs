import pkg from 'mongoose'
const { Schema, model, models } = pkg

export const Death =
  models.death ||
  model(
    'death',
    new Schema({
      date: Date,
      providerAccountId: String,
      bestScore: Number,
      currentScore: Number,
      life: Number,
      questions: [String],
    })
  )
