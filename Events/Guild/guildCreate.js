const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const ServerSettings = require('../../Models/ServerSettings');

module.exports = {
    name: 'guildCreate',
    async execute(guild) {
        try {
            const defaultChannel = guild.systemChannel || guild.channels.cache.find(channel => channel.type === 0 && channel.permissionsFor(guild.members.me).has('SEND_MESSAGES'));
            if (!defaultChannel) return;

            // Tüm metin kanallarını al
            const textChannels = guild.channels.cache.filter(channel => channel.type === 0).map(channel => ({
                label: channel.name,
                value: channel.id,
            }));

            const embed = new EmbedBuilder()
                .setColor('#e01444')
                .setTitle('Merhaba!')
                .setDescription("Beni sunucuna eklediğin için teşekkürler!\n\n'/' ön ekini kullanarak komutları çağırabilirsin.\n\n **Aşşağıdan botu kullanmak için gerekli kurulumları yapınız!**\n\n eğer eklediğiniz veya var olan kanallarınız gözükmüyorsa\n **'ayar_kanal_guncelle'** komutunu kullanarak kanalları güncelleyebilir\nve kurulumu yapabilirsiniz\n\n **Yukarıdaki ayarları yaptıktan sonra veya yapmadan önce \nşu anda bu mesajı okuduğunuz kanalın izinlerini değiştirmenizi öneririm.\n Çünkü bu mesajı okumasını istemediğiniz kişiler ayarlarınızı değiştirebilirler\n\n (Seçenekleri kullanmak için YÖNETİCİ rolüne sahip olmak gerekir)** \n\n**Herhangi bir kanala '/help' yazarak beni kullanmaya başlayabilirsin :)**");

            const sentMessage = await defaultChannel.send({ embeds: [embed] });
            await sentMessage.pin();

            // Oyun Kanalı Ayarları Mesajı
            const gameChannelEmbed = new EmbedBuilder()
                .setTitle('Oyun Kanalı Ayarı')
                .setDescription('Lütfen aşağıdaki seçim menüsünü kullanarak oyun kanalı seçin.')
                .setColor('#00FF00');

            const gameChannelRow = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_game_channel')
                        .setPlaceholder('Oyun kanalı seçin')
                        .addOptions(textChannels)
                );

            await defaultChannel.send({ embeds: [gameChannelEmbed], components: [gameChannelRow] });

            // Eğlence Kanalı Ayarları Mesajı
            const funChannelEmbed = new EmbedBuilder()
                .setTitle('Eğlence Kanalı Ayarı')
                .setDescription('Lütfen aşağıdaki seçim menüsünü kullanarak eğlence kanalı seçin.')
                .setColor('#00FF00');

            const funChannelRow = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_fun_channel')
                        .setPlaceholder('Eğlence kanalı seçin')
                        .addOptions(textChannels)
                );

            await defaultChannel.send({ embeds: [funChannelEmbed], components: [funChannelRow] });

            // Eğlence Kanalı Ayarları Mesajı
            const cekilisChannelEmbed = new EmbedBuilder()
                .setTitle('çekiliş Kanalı Ayarı')
                .setDescription('Lütfen aşağıdaki seçim menüsünü kullanarak çekiliş kanalı seçin.')
                .setColor('#00FF00');

            const cekilisChannelRow = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_cekilis_channel')
                        .setPlaceholder('Çekiliş kanalı seçin')
                        .addOptions(textChannels)
                );

            await defaultChannel.send({ embeds: [cekilisChannelEmbed], components: [cekilisChannelRow] });

            // Eğlence Kanalı Ayarları Mesajı
            const infoChannelEmbed = new EmbedBuilder()
                .setTitle('Bilgi Kanalı Ayarı')
                .setDescription('Lütfen aşağıdaki seçim menüsünü kullanarak Bilgi kanalı seçin.')
                .setColor('#00FF00');

            const infoChannelRow = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_info_channel')
                        .setPlaceholder('İnfo kanalı seçin')
                        .addOptions(textChannels)
                );

            await defaultChannel.send({ embeds: [infoChannelEmbed], components: [infoChannelRow] });

            // Eğlence Kanalı Ayarları Mesajı
            const levelsChannelEmbed = new EmbedBuilder()
                .setTitle('Level Kanalı Ayarı')
                .setDescription('Lütfen aşağıdaki seçim menüsünü kullanarak Level kanalı seçin.')
                .setColor('#00FF00');

            const levelsChannelRow = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_levels_channel')
                        .setPlaceholder('Level kanalı seçin')
                        .addOptions(textChannels)
                );

            await defaultChannel.send({ embeds: [levelsChannelEmbed], components: [levelsChannelRow] });

            // Eğlence Kanalı Ayarları Mesajı
            const moderationChannelEmbed = new EmbedBuilder()
                .setTitle('Moderasyon Kanalı Ayarı')
                .setDescription('Lütfen aşağıdaki seçim menüsünü kullanarak Moderasyon kanalı seçin.')
                .setColor('#00FF00');

            const moderationChannelRow = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_moderation_channel')
                        .setPlaceholder('Moderasyon kanalı seçin')
                        .addOptions(textChannels)
                );

            await defaultChannel.send({ embeds: [moderationChannelEmbed], components: [moderationChannelRow] });

            // Eğlence Kanalı Ayarları Mesajı
            const toolsChannelEmbed = new EmbedBuilder()
                .setTitle('Araçlar Kanalı Ayarı')
                .setDescription('Lütfen aşağıdaki seçim menüsünü kullanarak Araçlar kanalı seçin.')
                .setColor('#00FF00');

            const toolsChannelRow = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_tools_channel')
                        .setPlaceholder('Araçlar kanalı seçin')
                        .addOptions(textChannels)
                );

            await defaultChannel.send({ embeds: [toolsChannelEmbed], components: [toolsChannelRow] });

            // Eğlence Kanalı Ayarları Mesajı
            const pollChannelEmbed = new EmbedBuilder()
                .setTitle('Anket Kanalı Ayarı')
                .setDescription('Lütfen aşağıdaki seçim menüsünü kullanarak Anket kanalı seçin.')
                .setColor('#00FF00');

            const pollChannelRow = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_poll_channel')
                        .setPlaceholder('Anket kanalı seçin')
                        .addOptions(textChannels)
                );

            await defaultChannel.send({ embeds: [pollChannelEmbed], components: [pollChannelRow] });

            // Eğlence Kanalı Ayarları Mesajı
            const reactorChannelEmbed = new EmbedBuilder()
                .setTitle('Tepki Kanalı Ayarı')
                .setDescription('Lütfen aşağıdaki seçim menüsünü kullanarak Tepki kanalı seçin.')
                .setColor('#00FF00');

            const reactorChannelRow = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_reactor_channel')
                        .setPlaceholder('Tepki kanalı seçin')
                        .addOptions(textChannels)
                );

            await defaultChannel.send({ embeds: [reactorChannelEmbed], components: [reactorChannelRow] });

            // Eğlence Kanalı Ayarları Mesajı
            const ticketChannelEmbed = new EmbedBuilder()
                .setTitle('Ticket Kanalı Ayarı')
                .setDescription('Lütfen aşağıdaki seçim menüsünü kullanarak Ticket kanalı seçin.')
                .setColor('#00FF00');

            const ticketChannelRow = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('select_ticket_channel')
                        .setPlaceholder('Ticket kanalı seçin')
                        .addOptions(textChannels)
                );

            await defaultChannel.send({ embeds: [ticketChannelEmbed], components: [ticketChannelRow] });

            const welcomeChannel = new EmbedBuilder()
                .setTitle('Welcome Kanalı Ayarı **(YÖNETİCİ ROLÜ GEREKİR)**')
                .setDescription('Eğer welcome kanalı ayarlamak istiyorsanız **/welcome** yazarak welcome kanalını ayarla \n\n**(Welcome kanalı sunucunuza giren yeni kişilere hoş geldiniz mesajı gönderir)**')
                .setColor('#00FF00');

            await defaultChannel.send({ embeds: [welcomeChannel] });

            const goodbyeChannel = new EmbedBuilder()
                .setTitle('Goodbye Kanalı Ayarı **(YÖNETİCİ ROLÜ GEREKİR)**')
                .setDescription('Eğer Goodbye kanalı ayarlamak istiyorsanız **/goodbye** yazarak goodbye kanalını ayarla \n\n**(Goodbye kanalı sunucunuzdan çıkan kişileri gösterir)**')
                .setColor('#00FF00');

            await defaultChannel.send({ embeds: [goodbyeChannel] });

            const setlevelRole = new EmbedBuilder()
                .setTitle('Level İçin Rol atama **(MODERATÖR ROLÜ GEREKİR)**')
                .setDescription('Eğer sunucunda senin belirlediğin levele ulaşan birine rol vermek istiyosan belirlediğin seviyeye rol atayabilirsin, komutu kullanmak için **/setlevelrole** komutunu kullanarak istediğin seviyeye istediğin rolü atayabilirsin, istersen **/removelevelrole** komutunu kullanarak ayarladğın rolleri kaldırabilirsin ve ** ayarladığın level kanalında /listlevelrole** komutu ile ayarladığın rolleri görebilirsin. \n\n **(ZORUNLU DEĞİL)**')
                .setColor('#00FF00');

            await defaultChannel.send({ embeds: [setlevelRole] });

        } catch (error) {
            console.error('Bir hata oluştu', error);
            await defaultChannel.send({
                content: 'Bir hata oluştu veya bu seçenekleri kullanmak için belirli izinlere sahip değilsiniz!',
                ephemeral: true
            });
        }
    },
};
