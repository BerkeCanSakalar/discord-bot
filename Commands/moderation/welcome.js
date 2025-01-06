const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const welcomeSchema = require('../../Models/Welcome');
const ServerSettings = require('../../Models/ServerSettings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("welcome")
        .setDescription('Welcome Mesajı Ayarla')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(command => 
            command.setName('setup')
                .setDescription('Welcome Mesajı Ayarla')
                .addChannelOption(option => 
                    option.setName('channel')
                        .setDescription('Welcome Mesajı Gönderilecek Kanalı Seç')
                        .setRequired(true)
                )
                .addRoleOption(option =>
                    option.setName('welcome-role')
                        .setDescription('Welcome Mesajı Gönderilecek Rolü Seç')
                        .setRequired(true)
                )
                .addStringOption(option => 
                    option.setName('welcome-message')
                        .setDescription('Welcome Mesajı')
                        .setRequired(false)
                )
        )
        .addSubcommand(command => 
            command.setName('remove')
                .setDescription('Welcome Mesajı Kaldır')
        ),

    async execute(interaction) {

        const { options, guild } = interaction;
        const welcomeChannel = options.getChannel('channel');
        const role = options.getRole('welcome-role');
        const welcomeMessage = options.getString('welcome-message');

        if (!guild.members.me.permissions.has(PermissionFlagsBits.SendMessages)) {
            return interaction.reply({ content: '**Buna yetkin yok**', ephemeral: true });
        }

        const subcommand = options.getSubcommand();

        try {
            switch (subcommand) {
                case 'setup':
                    const existingData = await welcomeSchema.findOne({ Guild: guild.id });
                    if (existingData) {
                        return interaction.reply({ content: '**Zaten bir hoşgeldin mesajı ayarlanmış**', ephemeral: true });
                    }

                    const newWelcomeData = new welcomeSchema({
                        Guild: guild.id,
                        Channel: welcomeChannel.id,
                        Role: role.id,
                        Message: welcomeMessage
                    });
                    await newWelcomeData.save();
                    interaction.reply({ content: '☑️ Welcome mesajı başarıyla ayarlandı' });
                    break;

                case 'remove':
                    const dataToRemove = await welcomeSchema.findOne({ Guild: guild.id });
                    if (!dataToRemove) {
                        return interaction.reply({ content: 'Henüz bir hoşgeldin mesaj sistemi oluşturulmamış', ephemeral: true });
                    }
                    await welcomeSchema.deleteMany({ Guild: guild.id });
                    interaction.reply({ content: ' ☑️ Hoşgeldin mesajı başarıyla kaldırıldı', ephemeral: true });
                    break;

                default:
                    interaction.reply({ content: 'Geçersiz komut', ephemeral: true });
            }
        } catch (error) {
            console.error('Hata:', error);
            interaction.reply({ content: 'Bir hata oluştu, daha sonra tekrar deneyin', ephemeral: true });
        }

    }
};