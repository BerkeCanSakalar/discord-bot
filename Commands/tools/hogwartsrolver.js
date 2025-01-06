const { SlashCommandBuilder } = require('discord.js');
const HogwartsMessageModel = require('../../Models/HogwartsRoles'); // Yeni modeli içe aktar

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hogwartsrolver')
        .setDescription('Hogwarts hanelerine göre rol atamak için emojiye tıklayın.')
        .addChannelOption(option =>
            option.setName('kanal')
                .setDescription('Mesajın gönderileceği kanalı seçin.')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('gryffindor')
                .setDescription('Gryffindor rolünü seçin.')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('hufflepuff')
                .setDescription('Hufflepuff rolünü seçin.')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('ravenclaw')
                .setDescription('Ravenclaw rolünü seçin.')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('slytherin')
                .setDescription('Slytherin rolünü seçin.')
                .setRequired(true)),
    async execute(interaction) {
        const allowedUserIds = ['323975996829073418']; // Kullanıcı ID'lerini buraya girin

        if (!allowedUserIds.includes(interaction.user.id)) {
            return interaction.reply({ content: 'Bu komutu kullanma izniniz yok. Bu komut özel bir komut', ephemeral: true });
        }

        try {
            const channel = interaction.options.getChannel('kanal');
            const gryffindorRole = interaction.options.getRole('gryffindor');
            const hufflepuffRole = interaction.options.getRole('hufflepuff');
            const ravenclawRole = interaction.options.getRole('ravenclaw');
            const slytherinRole = interaction.options.getRole('slytherin');

            if (!channel || !gryffindorRole || !hufflepuffRole || !ravenclawRole || !slytherinRole) {
                return interaction.reply({ content: 'Bir hata oluştu. Lütfen tüm seçenekleri doğru girdiğinizden emin olun.', ephemeral: true });
            }

            if (!interaction.guild.members.me.permissions.has('MANAGE_ROLES')) {
                return interaction.reply({ content: 'Rolleri yönetmek için iznim yok.', ephemeral: true });
            }

            const message = await channel.send({
                content: 'Gryffindor için 🦁, Hufflepuff için 🦡, Ravenclaw için 🦅, Slytherin için 🐍 emojisine tıklayın.',
            });

            await message.react('🦁');
            await message.react('🦡');
            await message.react('🦅');
            await message.react('🐍');

            // Mesaj ve rol ID'lerini veritabanına kaydedin
            await HogwartsMessageModel.create({
                messageId: message.id,
                channelId: channel.id,
                guildId: interaction.guild.id,
                gryffindorRoleId: gryffindorRole.id,
                hufflepuffRoleId: hufflepuffRole.id,
                ravenclawRoleId: ravenclawRole.id,
                slytherinRoleId: slytherinRole.id
            });

            setupReactionCollector(message, gryffindorRole, hufflepuffRole, ravenclawRole, slytherinRole);

            await interaction.reply({ content: 'Mesaj gönderildi ve Hogwarts hane tepkileri ayarlandı! Bu mesaj artık süresiz aktif.', ephemeral: true });
        } catch (error) {
            console.error('Komut hatası:', error);
            await interaction.reply({ content: 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.', ephemeral: true });
        }
    },
    restoreHogwartsCollector // Fonksiyonu dışa aktarın
};

// Kolektörü kuran fonksiyon
function setupReactionCollector(message, gryffindorRole, hufflepuffRole, ravenclawRole, slytherinRole) {
    const filter = (reaction, user) => {
        return ['🦁', '🦡', '🦅', '🐍'].includes(reaction.emoji.name) && !user.bot;
    };

    const collector = message.createReactionCollector({ filter, dispose: true });

    collector.on('collect', async (reaction, user) => {
        try {
            const member = await message.guild.members.fetch(user.id);

            // Önce tüm Hogwarts rollerini kaldır
            await member.roles.remove([gryffindorRole, hufflepuffRole, ravenclawRole, slytherinRole]);

            // Kullanıcının seçtiği role göre rol ekle
            if (reaction.emoji.name === '🦁') {
                await member.roles.add(gryffindorRole);
            } else if (reaction.emoji.name === '🦡') {
                await member.roles.add(hufflepuffRole);
            } else if (reaction.emoji.name === '🦅') {
                await member.roles.add(ravenclawRole);
            } else if (reaction.emoji.name === '🐍') {
                await member.roles.add(slytherinRole);
            }

            // Kullanıcının diğer tepkilerini kaldır
            const userReactions = message.reactions.cache.filter((r) => r.users.cache.has(user.id) && r.emoji.name !== reaction.emoji.name);
            for (const userReaction of userReactions.values()) {
                await userReaction.users.remove(user.id);
            }
        } catch (error) {
            console.error('Rol değiştirme hatası:', error);
        }
    });

    collector.on('remove', async (reaction, user) => {
        try {
            const member = await message.guild.members.fetch(user.id);
            if (reaction.emoji.name === '🦁') {
                await member.roles.remove(gryffindorRole);
            } else if (reaction.emoji.name === '🦡') {
                await member.roles.remove(hufflepuffRole);
            } else if (reaction.emoji.name === '🦅') {
                await member.roles.remove(ravenclawRole);
            } else if (reaction.emoji.name === '🐍') {
                await member.roles.remove(slytherinRole);
            }
        } catch (error) {
            console.error('Rol kaldırma hatası:', error);
        }
    });
}

// Bot başlatıldığında eski mesajı ve kanalı kontrol edip kolektörü kur
async function restoreHogwartsCollector(client) {
    try {
        const messages = await HogwartsMessageModel.find();
        for (const data of messages) {
            const channel = client.channels.cache.get(data.channelId);
            if (channel) {
                channel.messages.fetch(data.messageId).then(async message => {
                    const guild = client.guilds.cache.get(data.guildId);

                    if (!guild) {
                        console.error('Sunucu bulunamadı.');
                        return;
                    }

                    // Rolleri ID'lerine göre alın
                    const gryffindorRole = guild.roles.cache.get(data.gryffindorRoleId);
                    const hufflepuffRole = guild.roles.cache.get(data.hufflepuffRoleId);
                    const ravenclawRole = guild.roles.cache.get(data.ravenclawRoleId);
                    const slytherinRole = guild.roles.cache.get(data.slytherinRoleId);

                    if (!gryffindorRole || !hufflepuffRole || !ravenclawRole || !slytherinRole) {
                        console.error('Rol hatası: Geçersiz rol.');
                        return;
                    }

                    // Reaksiyon kolektörünü yeniden kur
                    setupReactionCollector(message, gryffindorRole, hufflepuffRole, ravenclawRole, slytherinRole);
                }).catch(err => console.error('Mesaj bulunamadı:', err));
            }
        }
    } catch (error) {
        console.error('Kolektörleri geri yüklerken hata:', error);
    }
}
