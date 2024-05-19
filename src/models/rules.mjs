import pkg from 'mongoose'
const { Schema, model, models } = pkg

// les règles publiées dernièrement
export const Rules =
  models.rules ||
  model(
    'rules',
    new Schema({
      chapter: String,
      published_at: Date,
    })
  )
