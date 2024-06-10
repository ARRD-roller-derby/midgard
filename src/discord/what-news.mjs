import { Client, GatewayIntentBits, Partials } from 'discord.js'
let start = false

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.GuildEmojisAndStickers,
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.User],
})

export async function whatNews() {
  console.log('whatNews')
  const channel = client?.channels.cache.get(process.env.CHANNEL_BLABLA_ID)

  if (!channel) return
  start = true
  const content = `**Bonjour, c'est Sagwa !** 🍎 

  Vous pouvez également utiliser la commande **/events** comme sur le GIF ci-dessous pour déclarer votre présence aux entraînements ! 💪

  ---
  `

  await channel.send({
    content,
    files: ['F:/www/ARRD/midgard/events.gif'], // Lien vers votre GIF hébergé
  })
}

async function startF() {
  await client.login(process.env.DISCORD_TOKEN)
  const interval = setInterval(() => {
    whatNews()
    if (start) clearInterval(interval)
  }, 2000)
}

startF()
