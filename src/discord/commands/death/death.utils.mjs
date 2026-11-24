import { ActionRowBuilder, ButtonStyle, ButtonBuilder, MessageFlags } from 'discord.js'

import { db } from '../../../utils/db.mjs'
import { DeathCustomId } from './death.custom-id.mjs'
import { Death } from '../../../models/death.mjs'
import { getMembers } from '../../../utils/get_members.mjs'
import { getUserName } from '../../../utils/get-user-name.mjs'

export async function getHomeDeath(interaction) {
  await db()

  const score = await Death.findOne({
    providerAccountId: interaction.user.id,
  })

  // Fetch the top player for each difficulty level
  const bestUser = await Death.findOne({}).sort({
    bestScore: -1,
  })

  const users = await getMembers()

  if (!score) {
    score = {
      providerAccountId: interaction.user.id,
      date: new Date(),
      bestScore: 0,
      currentScore: 0,
      currentLevel: 0,
      life: 3,
      questions: [],
    }
    await Death.create(score)
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(DeathCustomId.noob)
      .setLabel('🍼 Noob (💚💚💚)')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(DeathCustomId.normal)
      .setLabel('🛼 Normal (💚💚)')
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId(DeathCustomId.hard)
      .setLabel('💀 Aard (💚)')
      .setStyle(ButtonStyle.Secondary)
  )

  let content = ''
  content += `🏁 **Bienvenue dans le jeu de la mort** ⚰️\n\n`

  // Get the usernames of the top players for each level

  if (bestUser) {
    const user = users.find((user) => user.id === bestUser.providerAccountId)
    if (user.id)
      content += `🥇 **${getUserName(
        user
      )}** est en tête du classement avec un score de **${bestUser.bestScore
        }**.\n\n`
  }

  content += '```markdown\n'
  content += `🏆 Ton meilleur score : ${score.bestScore}`
  content += '```\n'
  content += `--- \n`
  content += `💪 Choisis ton niveau de difficulté et voyons si tu as ce qu'il faut pour survivre sur la piste de derby !\n`
  content += `--- \n`

  return {
    content: content,
    flags: MessageFlags.Ephemeral,
    components: [row],
  }
}
