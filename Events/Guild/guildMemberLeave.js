const { EmbedBuilder, AttachmentBuilder } = require('discord.js');
const Schema = require('../../Models/Leave'); // Çıkış mesajlarını saklamak için kullanılan şema
const { profileImage } = require('discord-arts');

module.exports = {
    name: 'guildMemberRemove',
    async execute(member) {
        try {
            // Sunucunun veritabanında goodbye mesajı bulunup bulunmadığını kontrol edin
            const data = await Schema.findOne({ Guild: member.guild.id });
            if (!data) return;

            const channelID = data.Channel;
            const goodbyeMessage = data.Message || " ";

            // Sunucudan ayrılan üyenin bilgilerini alın
            const { user, guild } = member;

            // İlgili kanalı alın
            const goodbyeChannel = member.guild.channels.cache.get(channelID);
            if (!goodbyeChannel) return; // Kanal bulunamazsa işlemi sonlandır

            // Profil resmini al ve ek olarak ek bir dosya olarak ekleyin
            const profileBuffer = await profileImage(member.id);
            const imageAttachment = new AttachmentBuilder(profileBuffer, { name: 'profile.png' });

            // Çıkış mesajını oluşturun
            const goodbyeEmbed = new EmbedBuilder()
                .setTitle("**😞 Aramızdan Bir Kişi Daha Kaybettik 😞**")
                .setDescription(goodbyeMessage + `${member}`)
                .setColor(0xFF0000)
                .addFields({ name: 'Sunucu Üye Sayısı', value: `${guild.memberCount}`, inline: true })
                .setImage("attachment://profile.png")
                .setTimestamp(); // EmbedBuilder'dan Embed oluştur

            // Çıkış mesajını gönderin
            goodbyeChannel.send({ embeds: [goodbyeEmbed], files: [imageAttachment] });
        } catch (error) {
            console.error('Hata:', error);
        }
    }
};