const { SlashCommandBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Retrouvez des liens pour vous équiper !'),
  async execute(interaction) {
    const links = [
      {
        ulr: 'https://www.makadamshop.fr/',
        name: 'Makadam Rouen',
      },
      {
        url: 'https://www.suckerpunchskateshop.com/fr/',
        name: 'Sucker Punch Skate Shop',
      },
      {
        url: 'https://www.nomadeshop.com/fr/',
        name: 'Nomadeshop',
      },
      {
        url: 'https://www.decathlon.fr/browse/c0-tous-les-sports/c1-roller/c3-protections-de-roller/_/N-1dgaxh8',
        name: 'Decathlon',
      },
    ]

    const linksContent = links
      .map((link) => `🔗 [${link.name}](${link.url || link.ulr})`)
      .join('\n')

    const content = `    
    🛡️⚔️ Freya, votre déesse du roller derby, vous a préparé une liste de boutiques pour vous équiper comme une vraie Valkyrie sur roues :
    
    \n${linksContent}

    Que les dieux du roller vous accompagnent sur le champ de bataille !
    `

    await interaction.reply({
      content: content,
      ephemeral: true,
    })
  },
}
