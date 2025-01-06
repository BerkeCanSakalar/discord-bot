const {SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, ChannelType} = require('discord.js');
const TicketSetup = require('../../Models/Ticketsetup');
const ServerSettings = require('../../Models/ServerSettings');

module.exports = 
{
    data: new SlashCommandBuilder()
    .setName('ticketsetup')
    .setDescription("Ticket setup'ı oluştur")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addChannelOption(option => 
        option.setName('kanal')
        .setDescription('Ticketların hangi kanalda oluşturulacağını seçin')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addChannelOption(option => 
        option.setName('kategori')
        .setDescription('Ticketların hangi kategori sınıfında oluşturulacağını seçin')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildCategory)
    )
    .addChannelOption(option =>
        option.setName('transkript')
        .setDescription('transkriptlerin hangi kanalda oluşturulacağını seçin')
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .addRoleOption(option =>
        option.setName('rol')
        .setDescription('ticketları inceleyecek rolü seçin')
        .setRequired(true)
    )
    .addRoleOption(option =>
        option.setName('everyone')
        .setDescription("'@everyone' yazın")
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('açıklama')
        .setDescription('ticket için bir açıklama seçin')
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('ilkbutton')
        .setDescription("Format: (Butonun adı, Emoji)")
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('ikincibutton')
        .setDescription("Format: (Butonun adı, Emoji)")
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('üçüncübutton')
        .setDescription("Format: (Butonun adı, Emoji)")
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('dördüncübutton')
        .setDescription("Format: (Butonun adı, Emoji)")
        .setRequired(true)
    ),

    async execute(interaction)
    {
        try {
            // Fetch server settings to get the allowed game channel ID
            const serverSettings = await ServerSettings.findOne({ guildId: interaction.guild.id });
            const allowedChannelId = serverSettings?.ticket_channel;
    
            if (!allowedChannelId) {
                return interaction.reply({ content: "Ticket kanalı ayarlanmamış. Lütfen bir kanal ayarlayın.", ephemeral: true });
            }
    
            if (interaction.channelId !== allowedChannelId) {
                const allowedChannel = interaction.guild.channels.cache.get(allowedChannelId);
                return interaction.reply({ 
                    content: `**Bu komut bu kanalda kullanılamaz! Bu komutu **${allowedChannel ? allowedChannel.name : "Ticket"}** kanalı olarak ayarlanan kanalda kullanınız.**`, 
                    ephemeral: true 
                });
            }

        const {options, guild} = interaction;

        try
        {
            const channel = options.getChannel('kanal');
        const category = options.getChannel('kategori');
        const transcripts = options.getChannel('transkript');

        const handlers = options.getRole('rol');
        const everyone = options.getRole('everyone');

        const description = options.getString('açıklama');
        const firstbutton = options.getString('ilkbutton').split(",");
        const secondbutton = options.getString('ikincibutton').split(",");
        const thirdbutton = options.getString('üçüncübutton').split(",");
        const fourthbutton = options.getString('dördüncübutton').split(",");

        const emoji1 = firstbutton[1];
        const emoji2 = secondbutton[1];
        const emoji3 = thirdbutton[1];
        const emoji4 = fourthbutton[1];

        await TicketSetup.findOneAndUpdate(
            {GuildID: guild.id},
            {
                Channel: channel.id,
                Category: category.id,
                Transcripts: transcripts.id,
                Handlers: handlers.id,
                Everyone: everyone.id,
                Description: description,
                Buttons: [firstbutton[0], secondbutton[0], thirdbutton[0], fourthbutton[0]]
            },
            {
                new: true,
                upsert: true,
            }
        );

        const button = new ActionRowBuilder().setComponents(
            new ButtonBuilder().setCustomId(firstbutton[0]).setLabel(firstbutton[0]).setStyle(ButtonStyle.Danger).setEmoji(emoji1),
            new ButtonBuilder().setCustomId(secondbutton[0]).setLabel(secondbutton[0]).setStyle(ButtonStyle.Secondary).setEmoji(emoji2),
            new ButtonBuilder().setCustomId(thirdbutton[0]).setLabel(thirdbutton[0]).setStyle(ButtonStyle.Primary).setEmoji(emoji3),
            new ButtonBuilder().setCustomId(fourthbutton[0]).setLabel(fourthbutton[0]).setStyle(ButtonStyle.Success).setEmoji(emoji4),
        );

        const embed = new EmbedBuilder()
        .setDescription(description)

        await guild.channels.cache.get(channel.id).send({
            embeds: ([embed]),
            components: [button]
        });

        interaction.reply({content: "Ticket başarıyla gönderildi", ephemera: true});
        }
        catch(err)
        {
            console.log(err);
            const errEmbed = new EmbedBuilder()
            .setColor('Red')
            .setDescription("Bir hata oluştu...");

            return interaction.reply({embeds: [errEmbed], ephemeral: true});
        }
    } catch (error) {
        console.error('ticketsetup komutu sırasında bir hata oluştu:', error);
        await interaction.reply({
            content: 'ticketsetup komutu sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
            ephemeral: true
        });
    }

    },
};