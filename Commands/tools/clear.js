const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Belirtilen miktarda mesajı siler')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addIntegerOption(option =>
            option.setName('mesaj_sayisi')
                .setDescription('Silinecek mesaj sayısını giriniz')
                .setMinValue(1)
                .setMaxValue(100)
                .setRequired(true)
        ),
    async execute(interaction, client) {
        try {
            const { options } = interaction;
            const channel = interaction.channel;
            const messageCount = options.getInteger('mesaj_sayisi');

            // İşlemin başladığını belirtmek için yanıtı erteliyoruz
            await interaction.deferReply({ ephemeral: true });

            // Sabitlenmiş mesajları al
            const pinnedMessages = await channel.messages.fetchPinned();

            // Belirtilen miktarda mesajı getir
            const fetched = await channel.messages.fetch({ limit: messageCount });

            if (fetched.size === 0) {
                return await interaction.editReply({ content: 'Silinecek mesaj bulunamadı!', ephemeral: true });
            }

            // Sabitlenmiş mesajların ID'lerini koruma listesine ekleyin
            const protectedMessages = pinnedMessages.map(msg => msg.id);

            // Silinecek mesajları filtreleyin
            const messagesToDelete = fetched.filter(msg => !protectedMessages.includes(msg.id));

            if (messagesToDelete.size > 0) {
                await channel.bulkDelete(messagesToDelete);

                const embed = new EmbedBuilder()
                    .setColor("Yellow")
                    .setDescription(`☑️ **${messagesToDelete.size}** mesaj silindi.`);

                await interaction.editReply({ embeds: [embed], ephemeral: true });
            } else {
                await interaction.editReply({ content: 'Silinecek mesaj bulunamadı!', ephemeral: true });
            }
        } catch (error) {
            console.error('Mesaj silme işlemi sırasında bir hata oluştu:', error);

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'Ya kodu çalıştırırken bir hata oluştu ya da son 14 gün içerisinde gönderilen mesajları silmeye çalıştın!', ephemeral: true });
            } else {
                await interaction.editReply({ content: 'Ya kodu çalıştırırken bir hata oluştu ya da son 14 gün içerisinde gönderilen mesajları silmeye çalıştın!', ephemeral: true });
            }
        }
    }
};
