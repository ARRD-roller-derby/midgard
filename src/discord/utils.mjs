import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

const DEPLOY_TYPE = process.env.DEPLOY_TYPE || 'production'

export const DISCORD_TOKEN =
  DEPLOY_TYPE !== 'production'
    ? process.env.DISCORD_TOKEN_DEV
    : process.env.DISCORD_TOKEN
export const DISCORD_CLIENT_ID =
  DEPLOY_TYPE !== 'production'
    ? process.env.DISCORD_CLIENT_ID_DEV
    : process.env.DISCORD_CLIENT_ID
export const DISCORD_GUILD_ID =
  DEPLOY_TYPE !== 'production'
    ? process.env.DISCORD_GUILD_ID_DEV
    : process.env.DISCORD_GUILD_ID

export const CHAT_GPT_API = process.env.CHAT_GPT_API || ''
export const CHAT_GPT_ORG_ID = process.env.CHAT_GPT_ORG_ID || ''

export const BRAVE_TOKEN_SEARCH = process.env.BRAVE_TOKEN_SEARCH || ''

export function createAsciiBar(percentage) {
  const filledLength = Math.round(percentage / 10) // chaque 10% est un caractère rempli
  const emptyLength = 10 - filledLength
  const filledBar = '█'.repeat(filledLength)
  const emptyBar = '░'.repeat(emptyLength)
  return `${filledBar}${emptyBar} ${percentage}%`
}

export function createPagination(_page, end, customId) {
  const page = parseInt(_page)

  const first = new ButtonBuilder()
    .setCustomId(`${customId}-first`)
    .setLabel(`<<`)
    .setStyle(ButtonStyle.Secondary)

  const previous = new ButtonBuilder()
    .setCustomId(`${customId}-${page - 1}`)
    .setLabel(`<`)
    .setStyle(ButtonStyle.Secondary)

  const next = new ButtonBuilder()
    .setCustomId(`${customId}-${page + 1}`)
    .setLabel(`>`)
    .setStyle(ButtonStyle.Secondary)

  const last = new ButtonBuilder()
    .setCustomId(`${customId}-last`)
    .setLabel(`>>`)
    .setStyle(ButtonStyle.Secondary)

  if (page === 1) {
    first.setDisabled(true)
    previous.setDisabled(true)
  }

  if (page === end) {
    next.setDisabled(true)
    last.setDisabled(true)
  }

  return new ActionRowBuilder().addComponents(first, previous, next, last)
}
