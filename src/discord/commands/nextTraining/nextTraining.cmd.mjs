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
    const event = await valhalla('events/next-training', interaction.user.id, {
      type: 'training',
    })
    if (!event) {
      await interaction.reply({
        content: 'Aucun entraînement prévu pour le moment.',
        ephemeral: true,
      })
      return
    }

    const participants = event.participants.filter(
      (p) => !p.type.match(/absent|conf/)
    )

    /* ### Participant${participants.length > 1 ? 's' : ''} (${participants.length}) :
${ participants
  .sort((a, b) => {
    if (a.type.match(/patineur/)) return -1
    if (b.type.match(/patineur/)) return 1
    return 0
  })
  .map((p) => `\n- **${p?.name}** - (${participationToEmoji(p.type)})`)
.join(' ') } 
*/

    await interaction.reply({
      content: `
 ## ${event.title}
${dayjs(event.start).format('LLL')}
### ${dayjs(event.start).format('HH:mm')} à ${dayjs(event.end).format('HH:mm')}
*${event?.address?.label || 'Aucune adresse renseignée'}*

${event?.description?.content ? jsonToMd(event?.description?.content) : ''}

## ${participants.length} participant${participants.length > 1 ? 's' : ''}

      `,
      ephemeral: true,
      //  components: [row],
    })
  },
}

export default cmd
