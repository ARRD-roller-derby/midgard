import { EmbedBuilder, AttachmentBuilder } from 'discord.js'
import { Rules } from '../models/rules.mjs'
import { URL_API_DERBY_FRANCE } from '../utils/constants.mjs'
import { db } from '../utils/db.mjs'
import { client } from '../../index.mjs'

//for dev
let start = false

export async function weekRules() {
  //  if (start) return

  const channel = client.channels.cache.get(process.env.CHANNEL_BLABLA_ID)
  if (!channel) {
    console.error('Channel not found')
    return
  }
  start = true

  await db()
  console.log('🚀 Récupération des règles de la semaine')
  const previousPublished = await Rules.find()
    .sort({ published_at: -1 })
    .limit(10)

  try {
    const res = await fetch(URL_API_DERBY_FRANCE + 'rules')
    const rules = await res.json()
    const filteredRules = rules.filter(
      (r) => !previousPublished.find((p) => p.chapter === r.chapter)
    )

    const weeklyRules = filteredRules.length ? filteredRules : rules

    const random = Math.floor(Math.random() * weeklyRules.length)
    const rule = weeklyRules[random]

    await Rules.findOneAndUpdate(
      {
        chapter: rule.chapter,
      },
      {
        published_at: new Date(),
        chapter: rule.chapter,
      }
    )

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle(`Chapitre : ${rule.chapter}`)
      .setDescription(
        "Règle issue du document officiel de la WFTDA, traduit en français par Derby France. Pour consulter l'intégralité des règles, cliquez sur le lien ci-dessus."
      )
      .setURL('https://static.wftda.com/rules/wftda-rules-french.pdf')
      .setTimestamp()

    const MAX_DESCRIPTION_LENGTH = 1700

    if (rule.description.length > MAX_DESCRIPTION_LENGTH) {
      const formattedDescription = rule.description
        .split('. ')
        .map((line) => line.trim())
        .join('.\n')
      const buffer = Buffer.from(formattedDescription, 'utf-8')
      const attachment = new AttachmentBuilder(buffer, { name: 'rule.md' })

      await channel.send({
        content: '## Règle de la semaine\n',
        embeds: [embed],
        files: [attachment],
      })
    } else {
      await channel.send({
        content: '## Règles de la semaine\n' + rule.description + '---\n\n',
        embeds: [embed],
      })
    }
  } catch (error) {
    console.error(error)
  }
}
