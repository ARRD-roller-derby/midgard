import pkg from 'mongoose'
const { Schema, model, models } = pkg

const BadgeMedia = new Schema({
  url: String,
  type: String,
  name: String,
})

export const Badges =
  models.badges ||
  model(
    'badges',
    new Schema({
      date: Date,
      name: String,
      tags: [String],
      type: String,
      level: String,
      medias: [BadgeMedia],
      description: Object,
      isProgressive: Boolean,
    })
  )
