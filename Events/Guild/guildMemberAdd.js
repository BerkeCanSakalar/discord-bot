const { EmbedBuilder,AttachmentBuilder } = require('discord.js');
const Schema = require('../../Models/Welcome');
const { profileImage } = require('discord-arts');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        try {
            const data = await Schema.findOne({ Guild: member.guild.id });
            if (!data) return;

            const channelID = data.Channel;
            const Msg = data.Msg || " ";
            const Role = data.Role;

            const profileBuffer = await profileImage(member.id);
            const imageAttachment = new AttachmentBuilder(profileBuffer, { name: 'profile.png' });

            const { user, guild } = member;
            const welcomeChannel = member.guild.channels.cache.get(channelID);

            if (!welcomeChannel) return;

            const welcomeEmbed = new EmbedBuilder()
                .setTitle("**🌞 Sunucumuza Katılan Biri Daha 🌞**")
                .setDescription(Msg + `${member}`)
                .setColor(0x037821)
                .addFields({ name: 'Toplam Üye', value: `${guild.memberCount}`, inline: true })
                .setImage("attachment://profile.png")
                .setTimestamp();

                welcomeChannel.send({embeds:[welcomeEmbed], files: [imageAttachment]});
            await member.roles.add(Role);
        } catch (error) {
            console.error('Hata:', error);
        }
    }
};