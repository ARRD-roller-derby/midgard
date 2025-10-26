import { MessageFlags, SlashCommandBuilder } from "discord.js";
import { valhalla } from "../../../utils/valhalla.mjs";

export default {
  data: new SlashCommandBuilder()
    .setName('profil')
    .setDescription('Affiche mes infos'),
  async execute(interaction) {
    const data = await valhalla('me', interaction.user.id, {});

    const content = `---
    **N° licence :** ${data.licence_number}
    **Derby Name :** ${data.derby_name}
    **Nombre de roster :** ${data.roster_number}\n---
    `;
    await interaction.reply({
      content,
      flags: MessageFlags.Ephemeral
    });
  },
}