const {ChannelType, ButtonInteraction, ButtonBuilder, ActionRowBuilder, EmbedBuilder, ButtonStyle, PermissionFlagsBits} = require('discord.js');
const ticketSchema = require('../../Models/Ticket');
const ticketSetup = require('../../Models/Ticketsetup');
const TicketSetup = require('../../Models/Ticketsetup');

module.exports = 
{
    name: "interactionCreate",
    async execute(interaction)
    {
        const {guild, member, customId, channel} = interaction;
        const {ViewChannel, SendMessages, ManageChannels, ReadMessageHistory} = PermissionFlagsBits;
        const ticketId = Math.floor(Math.random() * 9000) + 10000;

        if(!interaction.isButton()) return;
        const data = await TicketSetup.findOne({GuildID: guild.id});

        if(!data) return;
        if(!data.Buttons.includes(customId)) return;
        if(!guild.members.me.permissions.has(ManageChannels)) interaction.reply({content: 'Buna yetkin yok', ephemeral: true});

        try{
            await guild.channels.create({
                name: `${member.user.username} -ticket${ticketId}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: data.Everyone,
                        deny: [ViewChannel, SendMessages, ReadMessageHistory],
                    },
                    {
                        id: member.id,
                        allow: [ViewChannel, SendMessages, ReadMessageHistory],
                    },
                ],
            }).then(async (channel) => {
                const newTicketSchema = await ticketSchema.create({
                    GuildID: guild.id,
                    ChannelID: channel.id,
                    TicketID: ticketId,
                    MembersID: member.id,
                    Closed: false,
                    Locked: false,
                    Type: customId,
                    Claimed: false,
                });

                const embed = new EmbedBuilder()
                .setTitle(`${guild.name} - Ticket ${customId}`)
                .setDescription("Ticket sıraya alınmıştır. En kısasürede yanıt verilecektir")
                .setFooter({text: `${ticketId}`, iconURL: member.displayAvatarURL({dynamic: true})})
                .setTimestamp();

                const button = new ActionRowBuilder().setComponents(
                    new ButtonBuilder().setCustomId('kapat').setLabel("Ticket'ı kapat").setStyle(ButtonStyle.Primary).setEmoji('🔴'),
                    new ButtonBuilder().setCustomId('kilitle').setLabel("Ticket'ı kilitle").setStyle(ButtonStyle.Secondary).setEmoji('🔒'),
                    new ButtonBuilder().setCustomId('aç').setLabel("Ticket'ı aç").setStyle(ButtonStyle.Success).setEmoji('🔓'),
                    new ButtonBuilder().setCustomId('talep').setLabel("Talep et").setStyle(ButtonStyle.Secondary).setEmoji('🔓'),
                );
                channel.send({
                    embeds: ([embed]),
                    components: [button]
                });

                interaction.reply({content: 'Ticket başarıyla oluşturuldu', ephemeral: true});
            })
        }

        catch(err)
        {
            return console.log(err);
        }
    }
}
