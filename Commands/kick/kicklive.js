const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const ServerSettings = require('../../Models/ServerSettings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kicklive')
        .setDescription('Kick üzerinde yayında olduğunu duyurur.'),
    async execute(interaction) {
        try {
            // Sunucu ayarlarını çekerek izin verilen kanal ID'sini al
            const serverSettings = await ServerSettings.findOne({ guildId: interaction.guild.id });
            const allowedChannelId = serverSettings?.kick_notification_channel;

            if (!allowedChannelId) {
                return interaction.reply({ content: "Kick bildirim kanalı ayarlanmamış. Lütfen bir kanal ayarlayın.", ephemeral: true });
            }

            if (interaction.channelId !== allowedChannelId) {
                const allowedChannel = interaction.guild.channels.cache.get(allowedChannelId);
                return interaction.reply({ 
                    content: `**Bu komut bu kanalda kullanılamaz! Bu komutu **${allowedChannel ? allowedChannel.name : "Bilgi"}** kanalı olarak ayarlanan kanalda kullanınız.**`, 
                    ephemeral: true 
                });
            }

            if (interaction.user.id !== '323975996829073418') {
                return interaction.reply({ content: 'Bu komutu kullanma yetkiniz yok.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('🟢 Rio şu anda canlı yayında!')
                .setDescription('Herkese selam! Şu anda Kick üzerinde yayındayım. Burdan canlı yayınıma katılabilrisiniz. [https://kick.com/aynirio]')
                .setTimestamp()
                .setFooter({ text: 'Yayın Başladı' });

            const button = new ButtonBuilder()
                .setLabel('Yayın Linki')
                .setURL('https://kick.com/aynirio')
                .setStyle(ButtonStyle.Link);

            const actionRow = new ActionRowBuilder()
                .addComponents(button);

            const channel = interaction.guild.channels.cache.get(allowedChannelId);
            await channel.send({ content: '@everyone', embeds: [embed], components: [actionRow] });
            return interaction.reply({ content: 'Yayın bildirimi gönderildi!', ephemeral: true });
        } catch (error) {
            console.error('kicklive komutu sırasında bir hata oluştu:', error);
            await interaction.reply({
                content: 'kicklive komutu sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
                ephemeral: true
            });
        }
    },
};
