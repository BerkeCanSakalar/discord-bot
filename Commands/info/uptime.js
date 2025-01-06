const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const ServerSettings = require('../../Models/ServerSettings');

module.exports =
{
    data: new SlashCommandBuilder()
    .setName("uptime")
    .setDescription("Botun Çalışma Süresini Gösterir"),

    async execute(interaction, client)
    {
        try {

        const days = Math.floor(client.uptime/ 86400000);
        const hours = Math.floor(client.uptime/ 3600000) % 24;
        const minutes = Math.floor(client.uptime/ 60000) % 60;
        const seconds = Math.floor(client.uptime/ 1000) % 60;

        const embed = new EmbedBuilder()
       .setTitle(`__${client.user.username} çalışma süresi__`)
       .setColor("Blue")
       .setTimestamp()
       .addFields(
        {name: 'Çalışma Süresi', value: ` \`${days}\` gün, \`${hours}\` saat, \`${minutes}\` dakika, \`${seconds}\` saniye`}
       )

       interaction.reply({embeds: [embed]});
    } catch (error) {
        console.error('uptime komutu sırasında bir hata oluştu:', error);
        await interaction.reply({
            content: 'uptime komutu sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
            ephemeral: true
        });
    }
    }
}