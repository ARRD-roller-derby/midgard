import pkg from 'mongoose'
const { Schema, model, models } = pkg

export const DISCORD_MESSAGE_TYPES = {
  dailyContest: 'dailyContest',
  chatGpt: 'chatGpt',
}

export const DiscordMessages =
  models.discordMessages ||
  model(
    'discord_messages',
    new Schema({
      id: String,
      createdAt: Date,
      type: String, // discordMessages
      threadId: String,
      messageId: String,
    })
  )
