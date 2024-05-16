import pkg from 'mongoose'
const { Schema, model, models } = pkg

export const DISCORD_MESSAGE_TYPES = {
  dailyContest: 'dailyContest',
}

export const DiscordMessages =
  models.discordMessages ||
  model(
    'discord_messages',
    new Schema({
      id: String,
      createdAt: Date,
      type: String, // discordMessages
    })
  )
