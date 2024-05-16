import mongoose from 'mongoose'

export async function db() {
  await mongoose.connect(process.env.MONGO_URI)
}
