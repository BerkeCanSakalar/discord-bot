const { EmbedBuilder } = require('discord.js');
const Levels = require('discord.js-leveling');
const LevelRole = require('../../Models/LevelRoles');

module.exports = {
    name: "messageCreate",

    async execute(message) {
        if (!message.guild || message.author.bot) return;
        if (message.content.length < 3) return;

        const randomAmountOfXp = Math.floor(Math.random() * 24) + 1;
        const hasLeveledUp = await Levels.appendXp(message.author.id, message.guild.id, randomAmountOfXp);

        if (hasLeveledUp) {
            const user = await Levels.fetch(message.author.id, message.guild.id);

            // Dinamik Rol Eşlemesi
            const levelRoleData = await LevelRole.findOne({ guildId: message.guild.id });
            if (levelRoleData) {
                console.log(`Level Role Data bulundu: ${JSON.stringify(levelRoleData)}`);
                if (levelRoleData.levelRoles.has(user.level.toString())) { // Seviyeyi stringe çevirerek kontrol edin
                    const roleId = levelRoleData.levelRoles.get(user.level.toString());
                    const role = message.guild.roles.cache.get(roleId);
                    if (role) {
                        await message.member.roles.add(role);
                        console.log(`Rol eklendi: ${role.name} seviyeye ulaşan ${message.author.tag} için.`);
                    } else {
                        console.log(`Rol bulunamadı: ID ${roleId}`);
                    }
                } else {
                    console.log(`Seviye ${user.level} için rol bulunamadı.`);
                }
            } else {
                console.log('Level Role Data bulunamadı.');
            }

            const levelEmbed = new EmbedBuilder()
                .setTitle("Yeni Seviye! 🎉")
                .setDescription(`**GG** ${message.author}, **${user.level}** seviyesine yükseldi!`)
                .setColor('Random')
                .setTimestamp();

            const sendEmbed = await message.channel.send({ embeds: [levelEmbed] });
            sendEmbed.react('✨');
        }
    }
};
