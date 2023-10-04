const { CHANNEL_BLABLA_ID } = require('../utils/constants')
const jsonfile = require('jsonfile')
const { webSearch } = require('../utils/web-search')
const dayjs = require('dayjs')
const { NodeHtmlMarkdown } = require('node-html-markdown')
const { Colors, EmbedBuilder } = require('discord.js')
const fs = require('fs')

const file = './data/news.json'

async function newsJob(client) {
  console.log('🚀 Lancement de la tâche news')
  const channel = client.channels.cache.get(CHANNEL_BLABLA_ID)
  if (channel) {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify([]))
    }

    const news = jsonfile.readFileSync(file)
    const search = await webSearch(
      `Roller Derby actualités ${dayjs().format('YYYY')}`
    )

    try {
      const articles = search.web.results
        .map((w) => {
          return {
            title: w.title,
            url: w.url,
            description: NodeHtmlMarkdown.translate(w.description),
            age: w.age ? dayjs(w.age).fromNow() : null,
          }
        })
        .filter((a) => {
          if (news.find((n) => n.url === a.url)) return false
          if (a.description === 'See posts, photos and more on Facebook')
            return false

          if (
            a.url ===
            'https://www.myrollerderby.com/evenements-matchs-et-tournois'
          )
            return false

          if (a.description.includes('Un calendrier des événements'))
            return false

          //eviter la page d'accueil
          if (a.description.includes("Retrouvez toute l'**actualité** "))
            return false

          return true
        })
      if (articles.length === 0) return console.log("Pas de news aujourd'hui")

      const article = articles[0]
      const exampleEmbed = new EmbedBuilder()
        .setColor(Colors.Aqua)
        .setTitle(article.title)
        .setURL(article.url)
        .setDescription(article.description)
        .setTimestamp()

      channel.send({
        content: 'Bonjour, voici votre sélection quotidienne de news :',
        embeds: [exampleEmbed],
      })

      jsonfile.writeFileSync(file, [...news, article], { spaces: 2 })
    } catch (error) {
      console.error(error)
    }
  }
}

module.exports = {
  newsJob,
}
