const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js')
const { openai } = require('../utils/ai')
const { valhalla } = require('../utils/valhalla')
const { CarpoolCustomId } = require('../commands/carpool/carpool.custom-id')
const { textDate } = require('../utils/text-date')

async function carpool(interaction) {
  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: `est ce que ce message: "${interaction.content}" est une demande pour un covoiturage ? tu dois me répondre UNIQUEMENT sous la forme d'un JSON avec une clé "carpool": boolean `,
        },
      ],
      model: 'gpt-3.5-turbo',
    })

    const response = JSON.parse(chatCompletion.choices[0].message.content)
    // pour finir le try catch, on vérifie que la réponse
    if (!response.carpool) return
  } catch (error) {
    console.log('ERROR - covoit', error)
  }

  const event = await valhalla('events/carpool', interaction.author.id)
  if (!event) return

  const content = `Il semblerait que tu recherches un **covoiturage** pour ${textDate(
    event
  )},
  souhaites-tu que je crée un **fil de discussion** pour toi ?`

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(CarpoolCustomId.cancel)
      .setLabel('Non merci')
      .setStyle(ButtonStyle.Danger),
    new ButtonBuilder()
      .setCustomId(CarpoolCustomId.create)
      .setLabel('Oui !')
      .setStyle(ButtonStyle.Success)
  )

  await interaction.author.send({
    content,
    components: [row],
  })
}

module.exports = {
  carpool,
}
