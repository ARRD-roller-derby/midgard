import pkg from 'mongoose'
const { Schema, model, models } = pkg

const RoleSchema = new Schema({
  id: String,
  name: String,
  color: Number,
})

export const Users =
  models.users ||
  model(
    'users',
    new Schema({
      providerAccountId: String,
      wallet: Number,
      name: String,
      derbyName: String,
      numRoster: Number,
      mst: Boolean,
      msp: Boolean,
      roles: [RoleSchema],
    })
  )
