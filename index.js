const fs = require('node:fs')
const path = require('node:path')
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js')
const { DISCORD_TOKEN } = require('./utils/constants')
const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')
const localizedFormat = require('dayjs/plugin/localizedFormat')
const timezone = require('dayjs/plugin/timezone')
const duration = require('dayjs/plugin/duration')
const fr = require('dayjs/locale/fr')
const weekday = require('dayjs/plugin/weekday')
const { addReaction } = require('./activities/add-reaction')
const { newMember } = require('./activities/new-member')

dayjs.extend(relativeTime)
dayjs.extend(localizedFormat)
dayjs.extend(timezone)
dayjs.extend(duration)
dayjs.extend(weekday)
dayjs.locale(fr)
dayjs.tz.guess()
dayjs.tz.setDefault('Europe/Paris')
console.log('🔴')

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
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildEmojisAndStickers,
  ],
  autoReconnect: true,
})
client.commands = new Collection()

const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)

const buttons = []
const modals = []
const selects = []

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder)
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('cmd.js'))

  const buttonFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('button.js'))

  const modalFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('modal.js'))

  const selectFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('select.js'))

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const command = require(filePath)
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command)
    } else {
      console.log(
        `🟥 🟥  le chemin ${filePath} ne possède pas de champ  "data" ou "execute".`
      )
    }
  }

  for (const file of modalFiles) {
    const filePath = path.join(commandsPath, file)
    const modale = require(filePath)
    if ('customId' in modale && 'execute' in modale) {
      buttons.push(modale)
    } else {
      console.log(
        `🟥 🟥  le chemin ${filePath} ne possède pas de champ  "customId"  ou "execute".`
      )
    }
  }

  for (const file of buttonFiles) {
    const filePath = path.join(commandsPath, file)
    const button = require(filePath)
    if ('customId' in button && 'execute' in button) {
      buttons.push(button)
    } else {
      console.log(
        `🟥 🟥  le chemin ${filePath} ne possède pas de champ  "customId"  ou "execute".`
      )
    }
  }

  for (const file of selectFiles) {
    const filePath = path.join(commandsPath, file)
    const select = require(filePath)
    if ('customId' in select && 'execute' in select) {
      selects.push(select)
    } else {
      console.log(
        `🟥 🟥  le chemin ${filePath} ne possède pas de champ  "customId", "name" ou "execute".`
      )
    }
  }
}

console.log('🟡')
;(async () => {
  client.once(Events.ClientReady, () => {
    console.log('🟢')
  })

  // événements Passifs - ne nécessitent pas d'interaction de l'utilisateur
  client.on(Events.GuildMemberAdd, newMember)
  client.on(Events.MessageCreate, postMessage)
  client.on(Events.MessageReactionAdd, addReaction)

  // événements Actifs - nécessitent une interaction de l'utilisateur
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isStringSelectMenu()) {
      const select = selects.find((sel) => {
        const regId = new RegExp(sel.customId, 'i')
        return regId.test(interaction.customId)
      })

      if (select) select.execute(interaction, client)
    }
    if (interaction.isButton()) {
      const button = buttons.find((button) => {
        const regId = new RegExp(button.customId, 'i')
        return regId.test(interaction.customId)
      })
      if (button) button.execute(interaction, client)
    }

    if (interaction.isModalSubmit()) {
      const modal = modals.find((mod) => {
        const regId = new RegExp(mod.customId, 'i')
        return regId.test(interaction.customId)
      })
      if (modal) modal.execute(interaction, client)
    }

    if (!interaction.isChatInputCommand()) return

    const command = client.commands.get(interaction.commandName)

    if (!command) return

    try {
      await command.execute(interaction, client)
    } catch (error) {
      console.error(error)

      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'Il y a un problème avec la commande !',
          ephemeral: true,
        })
      } else {
        await interaction.reply({
          content: 'Il y a un problème avec la commande !',
          ephemeral: true,
        })
      }
    }
  })
  client.login(DISCORD_TOKEN)
})()
