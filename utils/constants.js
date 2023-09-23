require('dotenv').config()

const DEPLOY_TYPE = process.env.DEPLOY_TYPE || 'production'

const DISCORD_TOKEN =
  DEPLOY_TYPE !== 'production'
    ? process.env.DISCORD_TOKEN_DEV
    : process.env.DISCORD_TOKEN
const DISCORD_CLIENT_ID =
  DEPLOY_TYPE !== 'production'
    ? process.env.DISCORD_CLIENT_ID_DEV
    : process.env.DISCORD_CLIENT_ID
const DISCORD_GUILD_ID =
  DEPLOY_TYPE !== 'production'
    ? process.env.DISCORD_GUILD_ID_DEV
    : process.env.DISCORD_GUILD_ID

const CHAT_GPT_API = process.env.CHAT_GPT_API || ''
const VALHALLA_URL =
  DEPLOY_TYPE !== 'production'
    ? 'http://localhost:3000'
    : process.env.VALHALLA_URL || ''

const VALHALLA_TOKEN = process.env.VALHALLA_TOKEN || ''

module.exports = {
  DISCORD_TOKEN: DISCORD_TOKEN || '',
  DISCORD_CLIENT_ID: DISCORD_CLIENT_ID || '',
  DISCORD_GUILD_ID: DISCORD_GUILD_ID || '',

  DEPLOY_TYPE: process.env.DEPLOY_TYPE || 'production',
  CHAT_GPT_API,
  VALHALLA_URL,
  VALHALLA_TOKEN,
}
