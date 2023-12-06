const { CHANNEL_BLABLA_ID } = require('../utils/constants')
const { mongoDb } = require('../utils/db')
const { webSearch } = require('../utils/web-search')
const dayjs = require('dayjs')
const { NodeHtmlMarkdown } = require('node-html-markdown')
const { Colors, EmbedBuilder } = require('discord.js')
const { News } = require('../models/news')

async function newsJob(client) {
  console.log('🚀 Lancement de la tâche news')
  const channel = client.channels.cache.get(CHANNEL_BLABLA_ID)

  if (channel) {
    const search = await webSearch(
      `Roller Derby actualités ${dayjs().format('YYYY')}`
    )

    await mongoDb()
    const news = await News.find()

    console.log('_____', news)
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

          if (a.url.startsWith('https://www.myrollerderby.com')) {
            return a.url.match(/actualite\/post/i)
          }

          if (a.description.includes('Un calendrier des événements'))
            return false

          //éviter la page d'accueil
          if (a.description.includes("Retrouvez toute l'**actualité** "))
            return false

          return true
        })
      if (articles.length === 0) return console.log("Pas de news aujourd'hui")

      const article = articles[0]
      await News.create({ url: article.url, created_at: new Date() })

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
    } catch (error) {
      console.error(error)
    }
  }
}

module.exports = {
  newsJob,
}
