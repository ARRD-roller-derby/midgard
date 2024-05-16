import { REST, Routes } from 'discord.js'
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const __dirname = path.resolve()

const commands = []
// Grab all the command folders from the commands directory you created earlier
const foldersPath = path.join(__dirname, '/src/discord/commands')
const commandFolders = fs.readdirSync(foldersPath)

for (const folder of commandFolders) {
  // Grab all the command files from the commands directory you created earlier
  const commandsPath = path.join(foldersPath, folder)

  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith('cmd.mjs'))
  // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file)
    const fileURL = pathToFileURL(filePath).href

    try {
      const item = await import(fileURL)
      const command = item.default

      console.log(`📦 Importation de la commande: ${command.data.name}`)
      commands.push(command.data.toJSON())
    } catch (error) {
      console.error(
        `Erreur lors de l'importation du fichier ${filePath}:`,
        error
      )
    }
  }
}

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN)

// and deploy your commands!
;(async () => {
  try {
    console.log(
      `🕐 Début de la mise à jour des ${commands.length} commandes (/).`
    )

    // The put method is used to fully refresh all commands in the guild with the current set
    const data = await rest.put(
      Routes.applicationGuildCommands(
        process.env.DISCORD_CLIENT_ID,
        process.env.DISCORD_GUILD_ID
      ),
      { body: commands }
    )

    console.log(`🟢 ${data.length} commandes ont été mise à jour.`)
  } catch (error) {
    // And of course, make sure you catch and log any errors!
    console.error(error)
  }
})()
