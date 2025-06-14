import { MessageFlags, SlashCommandBuilder } from 'discord.js'
import { URL_API_DERBY_FRANCE } from '../../../utils/constants.mjs'
import { EmbedBuilder } from 'discord.js'
import { AttachmentBuilder } from 'discord.js'

const cmd = {
  data: new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Rechercher une règles.')
    .addStringOption((option) =>
      option
        .setName('search')
        .setDescription('Terme(s) à rechercher')
        .setRequired(true)
    ),
  async execute(interaction) {
    const search = interaction.options.getString('search')

    const res = await fetch(URL_API_DERBY_FRANCE + 'rules/search/' + search)

    if (!res.ok) {
      await interaction.reply({
        content: 'Impossible de récupérer les règles.',
        flags: MessageFlags.Ephemeral,
      })
      return
    }

    const rules = await res.json()

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`Recherche : ${search}`)
      .setDescription(
        "Règle issue du document officiel de la WFTDA, traduit en français par Derby France. Pour consulter l'intégralité des règles, cliquez sur le lien ci-dessus."
      )
      .setURL('https://static.wftda.com/rules/wftda-rules-french.pdf')
      .setTimestamp()

    let formattedDescription = ''
    rules.forEach((rule) => {
      formattedDescription += `[${rule.chapter}] ${rule.title}\n`
      formattedDescription += rule.description + '\n\n'
    })

    const buffer = Buffer.from(formattedDescription, 'utf-8')
    const attachment = new AttachmentBuilder(buffer, { name: 'rule.txt' })

    await interaction.reply({
      content: `## Résultat de ta recherche (${search})\n\n----`,
      embeds: [embed],
      files: [attachment],
      flags: MessageFlags.Ephemeral,
    })
  },
}

export default cmd
