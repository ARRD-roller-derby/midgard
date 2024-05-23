import { botStart } from './discord.mjs'
let start = false
let client
export async function whatNews() {
  console.log('whatNews')
  const channel = client?.channels.cache.get(process.env.CHANNEL_BLABLA_ID)

  if (!channel) return
  start = true
  const content = `**Bonjour, c'est Sagwa !** 🍎 Voici mes nouvelles fonctionnalités :

    **Les commandes ajoutées :**

- **/stats** : Uniquement pour le bureau, cette commande permet de voir les taux de présences et de télécharger une feuille Excel.
- **/rules [termes à rechercher]** : Utilisez cette commande pour consulter une règle officielle en un clin d'œil !
- **/events** : Naviguez d'un événement à l'autre et indiquez même votre présence !

    Tous les messages que j'affiche via ces commandes ne sont visibles que par celui qui les déclenche. 🤫
  `
  await channel.send({
    content,
  })
}

async function startF() {
  client = await botStart()

  const interval = setInterval(() => {
    whatNews()
    if (start) clearInterval(interval)
  }, 2000)
}

startF()
