import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'url'
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js'
import { postMessage } from './activities/post-message.mjs'
import { pathToFileURL } from 'node:url'
import { reactionManager } from './activities/reaction-manager.mjs'
import { Partials } from 'discord.js'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
    GatewayIntentBits.GuildEmojisAndStickers,
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.User],
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
    .filter((file) => file.endsWith('cmd.mjs'))

  const buttonFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('button.mjs'))

  const modalFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('modal.mjs'))

  const selectFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('select.mjs'))

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const fileURL = pathToFileURL(filePath).href

    import(fileURL)
      .then((item) => {
        const command = item.default
        if ('data' in command && 'execute' in command) {
          client.commands.set(command.data.name, command)
        } else {
          console.log(
            `🟥 🟥  le chemin ${filePath} ne possède pas de champ "data" ou "execute".`
          )
        }
      })
      .catch((error) => {
        console.error(
          `Erreur lors de l'importation du fichier ${filePath}:`,
          error
        )
      })
  }

  for (const file of modalFiles) {
    const filePath = path.join(commandsPath, file)
    const fileURL = pathToFileURL(filePath).href
    import(fileURL)
      .then((item) => {
        const modale = item.default
        if ('customId' in modale && 'execute' in modale) {
          modals.push(modale)
        } else {
          console.log(
            `🟥 🟥  le chemin ${filePath} ne possède pas de champ  "customId"  ou "execute".`
          )
        }
      })
      .catch((error) => {
        console.error(
          `Erreur lors de l'importation du fichier ${filePath}:`,
          error
        )
      })
  }

  for (const file of buttonFiles) {
    const filePath = path.join(commandsPath, file)
    const fileURL = pathToFileURL(filePath).href
    import(fileURL)
      .then((item) => {
        const button = item.default

        if ('customId' in button && 'execute' in button) {
          buttons.push(button)
        } else {
          console.log(
            `🟥 🟥  le chemin ${filePath} ne possède pas de champ  "customId"  ou "execute".`
          )
        }
      })
      .catch((error) => {
        console.error(
          `Erreur lors de l'importation du fichier ${filePath}:`,
          error
        )
      })
  }

  for (const file of selectFiles) {
    const filePath = path.join(commandsPath, file)
    const fileURL = pathToFileURL(filePath).href
    import(fileURL)
      .then((item) => {
        const select = item.default
        if ('customId' in select && 'execute' in select) {
          selects.push(select)
        } else {
          console.log(
            `🟥 🟥  le chemin ${filePath} ne possède pas de champ  "customId", "name" ou "execute".`
          )
        }
      })
      .catch((error) => {
        console.error(
          `Erreur lors de l'importation du fichier ${filePath}:`,
          error
        )
      })
  }
}

console.log('🟡')
export async function botStart() {
  client.once(Events.ClientReady, () => {
    console.log('🟢')
  })

  // événements Passifs - ne nécessitent pas d'interaction de l'utilisateur

  client.on(Events.MessageCreate, (i) => postMessage(i, client))
  client.on(Events.MessageReactionAdd, (interaction, user) =>
    reactionManager(interaction, user, 'add', client)
  )
  client.on(Events.MessageReactionRemove, (interaction, user) =>
    reactionManager(interaction, user, 'remove', client)
  )

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

  client.login(process.env.DISCORD_TOKEN)

  return client
}
