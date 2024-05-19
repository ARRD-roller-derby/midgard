import pkg from 'mongoose'
const { Schema, model, models } = pkg

const ParticipantSchema = new Schema({
  userId: String,
  status: String,
  updatedAt: Date,
  type: String,
  name: String,
  guestsNumber: Number,
})

export const Events =
  models.events ||
  model(
    'events',
    new Schema({
      visibility: String,
      cancelled: Boolean,
      recurrenceId: String,
      type: String,
      description: Object,
      title: String,
      start: Date,
      end: Date,
      participants: [ParticipantSchema],
      address: {
        label: String,
        lat: Number,
        lon: Number,
      },
      leader: {
        userId: String,
        name: String,
      },
    })
  )
