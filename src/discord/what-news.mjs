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
  const content = `**Bonjour, c'est Sagwa !** 🍎 Voici mes nouvelles fonctionnalités :

    **Les commandes ajoutées :**

- **/stats** : Uniquement pour le bureau, cette commande permet de voir les taux de présences et de télécharger une feuille Excel.
- **/rules [termes à rechercher]** : Utilisez cette commande pour consulter une règle officielle en un clin d'œil !
- **/events** : Naviguez d'un événement à l'autre et indiquez même votre présence sans passer par Valhalla ! 🎉

    **Gagnez des Dragons 🐉 :**
- Répondez aux quizz pour gagner des Dragons !
- Renseignez votre présence aux entraînements pour obtenir encore plus de Dragons !

    **Nouvelles capacités :**
- Je peux désormais répondre aux questions que vous me posez en réponse à l'un de mes messages, bien que je sois parfois limitée (미안해 (désolée), je ne comprends pas encore assez bien le français pour tout comprendre). Sachez que certaines de mes réponses peuvent coûter des Dragons.

    **Autres fonctionnalités :**
- En attendant, je connais les statuts et le règlement intérieur de l'association et je suis capable de fournir quelques réponses.
- Vous pourrez bientôt découvrir un nouveau canal où vous pourrez dépenser vos Dragons tout en vous amusant... mais je garde la surprise pour le moment ! 😉

    Tous les messages que j'affiche via ces commandes ne sont visibles que par celui qui les déclenche. 🤫
`

  await channel.send({
    content,
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
