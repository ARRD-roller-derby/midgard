import pkg from 'mongoose'
const { Schema, model, models } = pkg

export const News =
  models.news ||
  model(
    'news',
    new Schema({
      url: String,
      created_at: Date,
    })
  )
