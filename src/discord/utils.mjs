const DEPLOY_TYPE = process.env.DEPLOY_TYPE || 'production'

export const typeOfVisitorsJmsx = {
  visitors: {
    name: 'Visiteurs',
    seat: 65,
    price: 10,
    emoji: '👥',
  },
  exhibitors: {
    name: 'Exposants',
    seat: 10,
    price: 15,
    emoji: '🎪',
  },
  students: {
    name: 'Etudiants ISART',
    seat: 20,
    price: 0,
    emoji: '🎓',
  },
  gamJam: {
    name: 'Jammmeurs',
    seat: 20,
    price: 0,
    emoji: '🕹',
  },
  staff: {
    name: 'Staff',
    seat: 10,
    price: 0,
    emoji: '🛠',
  },
  guests: {
    name: 'Invités',
    seat: 10,
    price: 0,
    emoji: '🎟',
  },
}

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
