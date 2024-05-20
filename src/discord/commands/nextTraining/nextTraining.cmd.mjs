import { SlashCommandBuilder } from 'discord.js'
import { valhalla } from '../../../utils/valhalla.mjs'
import dayjs from 'dayjs'
import { jsonToMd } from '../../../utils/json-to-md.mjs'

//TYPE patin...
const cmd = {
  data: new SlashCommandBuilder()
    .setName('next-training')
    .setDescription('Toutes les infos sur le prochain entraînement.'),
  async execute(interaction) {
    try {
      // Déférer la réponse initiale pour garantir que l'interaction est répondue
      await interaction.deferReply({ ephemeral: true })

      const event = await valhalla('events/next-training', interaction.user.id)
      if (!event) {
        return await interaction.editReply({
          content: 'Aucun entraînement prévu pour le moment.',
        })
      }

      const participants = event.participants.filter(
        (p) => !p.type.match(/absent|conf/)
      )

      return await interaction.editReply({
        content: `
 ## ${event.title}
${dayjs(event.start).format('LLL')}
### ${dayjs(event.start).format('HH:mm')} à ${dayjs(event.end).format('HH:mm')}
*${event?.address?.label || 'Aucune adresse renseignée'}*

${event?.description?.content ? jsonToMd(event?.description?.content) : ''}

## ${participants.length} participant${participants.length > 1 ? 's' : ''}
      `,
      })
    } catch (e) {
      console.error(e)
      // Utiliser editReply au lieu de reply dans le catch
      return await interaction.editReply({
        content: 'Une erreur est survenue.',
      })
    }
  },
}

export default cmd
