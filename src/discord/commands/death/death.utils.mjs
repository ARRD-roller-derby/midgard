import { ActionRowBuilder, ButtonStyle, ButtonBuilder } from 'discord.js'

import { db } from '../../../utils/db.mjs'
import { DeathCustomId } from './death.custom-id.mjs'
import { Death } from '../../../models/death.mjs'

export async function getHomeDeath(interaction) {
  await db()

  let score = await Death.findOne({
    providerAccountId: interaction.user.id,
  })

  if (!score) {
    score = {
      providerAccountId: interaction.user.id,
      date: new Date(),
      bestScore: 0,
      currentScore: 0,
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
  content += '```markdown\n'
  content += `🏆 Ton meilleur score : ${score.bestScore}`
  content += '```\n'
  content += `--- \n`
  content += `💪 Choisis ton niveau de difficulté et voyons si tu as ce qu'il faut pour survivre sur la piste de derby !\n`
  content += `--- \n`

  return {
    content: content,
    ephemeral: true,
    components: [row],
  }
}
