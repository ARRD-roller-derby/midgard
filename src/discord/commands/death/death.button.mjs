import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonStyle,
  ButtonBuilder,
} from 'discord.js'
import { Death } from '../../../models/death.mjs'
import { Questions } from '../../../models/questions.mjs'
import { db } from '../../../utils/db.mjs'
import { DeathCustomId } from './death.custom-id.mjs'
import validator from 'validator'
import Canvas from '@napi-rs/canvas'
import { emojis } from '../../../utils/emojis.mjs'
import { getHomeDeath } from './death.utils.mjs'

const btn = {
  customId: DeathCustomId.button,
  execute: async (interaction) => {
    await interaction.deferUpdate()

    const scope = interaction.customId.split('-')[2]

    const res = {}

    await db()

    if (scope === 'replay')
      return await interaction.editReply(await getHomeDeath(interaction))

    if (scope === 'level') {
      const life = parseInt(interaction.customId.split('-')[3])

      const multiplier = {
        1: 4,
        2: 2,
        3: 1,
      }

      await Death.findOneAndUpdate(
        {
          providerAccountId: interaction.user.id,
        },
        {
          $set: {
            life,
            currentScore: 0,
            currentLevel: multiplier[life],
            questions: [],
          },
        }
      )
    }

    const user = await Death.findOne({
      providerAccountId: interaction.user.id,
    })

    if (scope === 'response') {
      const isBad = interaction.customId.split('-')[3] === 'bad'
      if (isBad) user.life -= 1

      if (user.life < 1) {
        const currentScore = user.currentScore * user.currentLevel
        const bestScore =
          user.bestScore < currentScore ? currentScore : user.bestScore
        await Death.findOneAndUpdate(
          {
            providerAccountId: interaction.user.id,
          },
          {
            $set: {
              life: 0,
              bestScore,
            },
          }
        )

        let contentLoose = ''
        contentLoose += `💀💀💀\n\n`
        contentLoose += '```markdown\n'
        contentLoose += `🏆 Ton score actuel : ${currentScore}`
        contentLoose += '```\n'
        contentLoose += '```markdown\n'
        contentLoose += `🏆 Ton meilleur score : ${bestScore}`
        contentLoose += '```\n'
        contentLoose += `--- \n`

        return interaction.editReply({
          content: contentLoose,
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId(DeathCustomId.replay)
                .setLabel('Rejouer')
                .setStyle(ButtonStyle.Primary)
            ),
          ],
          files: [],
        })
      }
    }

    const _questions = await Questions.find({
      status: {
        $ne: 'draft',
      },

      _id: {
        $nin: user.questions.map((q) => q._id),
      },
    })

    // ==== End of the game if no questions ====
    if (!_questions.length) {
      let contentLoose = ''
      contentLoose += `Tu as répondu à toutes les questions !\n\n`
      contentLoose += '```markdown\n'
      contentLoose += `🏆 Ton score actuel : ${user.currentScore}`
      contentLoose += '```\n'
      contentLoose += '```markdown\n'
      contentLoose += `🏆 Ton meilleur score : ${bestScore}`
      contentLoose += '```\n'
      contentLoose += `--- \n`

      return interaction.editReply({
        content: contentLoose,
        components: [
          new ActionRowBuilder().addComponents(
            new ButtonBuilder()
              .setCustomId(DeathCustomId.replay)
              .setLabel('Rejouer')
              .setStyle(ButtonStyle.Primary)
          ),
        ],
        files: [],
      })
    }

    // Randomize questions
    const questions = _questions.sort(() => Math.random() - 0.5)

    const rowLife = new ActionRowBuilder()

    rowLife.addComponents(
      new ButtonBuilder()
        .setCustomId(DeathCustomId.button + '-life-0')
        .setLabel(`Vie${user.life < 1 ? 's' : ''} :`)
        .setDisabled(true)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(DeathCustomId.button + '-life-3')
        .setLabel('💚')
        .setDisabled(true)
        .setStyle(ButtonStyle.Success)
    )

    if (user.life > 1) {
      rowLife.addComponents(
        new ButtonBuilder()
          .setCustomId(DeathCustomId.button + '-life-2')
          .setLabel('💚')
          .setDisabled(true)
          .setStyle(ButtonStyle.Success)
      )
    }

    if (user.life > 2) {
      rowLife.addComponents(
        new ButtonBuilder()
          .setCustomId(DeathCustomId.button + '-life-1')
          .setLabel('💚')
          .setDisabled(true)
          .setStyle(ButtonStyle.Success)
      )
    }

    const question = questions[0]

    await Death.findOneAndUpdate(
      {
        providerAccountId: interaction.user.id,
      },
      {
        $push: {
          questions: question._id,
        },
        $set: {
          currentScore: user.currentScore + 1,
          life: user.life,
        },
      }
    )

    if (question.img) {
      const background = await Canvas.loadImage(question.img)
      const canvas = Canvas.createCanvas(background.width, background.height)
      const context = canvas.getContext('2d')
      context.drawImage(background, 0, 0)

      res.files = [
        new AttachmentBuilder(await canvas.encode('png'), {
          name: 'img.png',
        }),
      ]
    } else {
      res.files = []
    }

    let content = ''
    content += validator.unescape(question.question)
    content += '\n\n'

    const randomAnswers = question.answers.sort(() => Math.random() - 0.5)

    const components = [rowLife]

    // Diviser les réponses en lignes (maximum 5 par ligne)
    let rowsAnswers = []
    let currentRow = new ActionRowBuilder()

    randomAnswers.forEach((answer, idx) => {
      const emoji = emojis[idx]
      content += `**${emoji} :** ${validator.unescape(answer.answer || '')}\n`

      const answerBtn = new ButtonBuilder()
        .setCustomId(DeathCustomId.response + answer.type + '-' + idx)
        .setLabel(emoji)
        .setStyle(ButtonStyle.Secondary)

      currentRow.addComponents(answerBtn)

      // Chaque ligne ne doit pas dépasser 5 boutons
      if ((idx + 1) % 5 === 0 || idx === randomAnswers.length - 1) {
        rowsAnswers.push(currentRow)
        currentRow = new ActionRowBuilder() // Nouvelle ligne pour les boutons suivants
      }
    })

    content += `\n------------------------`

    components.push(...rowsAnswers)

    await interaction.editReply({
      content,
      components,
      ...res,
    })
  },
}

export default btn
