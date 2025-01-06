const { Client, GatewayIntentBits, Partials, Collection, EmbedBuilder, ButtonBuilder, Events, ActionRowBuilder, ButtonStyle, ActivityType } = require('discord.js');
const mongoose = require('mongoose');
const axios = require('axios');

/* const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.get('/commands', (req, res) => {
  res.sendFile(__dirname + '/public/commands.html');
});

app.listen(port, () => {
  console.log(`Web sunucusu http://localhost:${port} adresinde çalışıyor.`);
}); */



const { Guilds, GuildMembers, GuildMessages, MessageContent, GuildMessageReactions, GuildModeration } = GatewayIntentBits;
const { User, Message, GuildMember, ThreadMember, Channel, DirectMessages } = Partials;

const { loadEvents } = require('./Handlers/eventHandler');
const { loadCommands } = require('./Handlers/commandHandler');
const { restoreReactionCollector } = require('./Commands/tools/animalrolver');
const { restoreHogwartsCollector } = require('./Commands/tools/hogwartsrolver');
const { restoreGenderCollector } = require('./Commands/tools/genderrolver');

const client = new Client({
    intents: [Guilds, GuildMembers, GuildMessages, 'GuildVoiceStates', MessageContent, GuildMessageReactions, GuildModeration, GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent],
    partials: [User, Message, GuildMember, ThreadMember, Channel, DirectMessages],
    allowedMentions: {
        repliedUser: false,
    },
});

client.on("ready", (client) => {
    console.log("Now Online: " + client.user.tag);
    restoreReactionCollector(client);
    restoreHogwartsCollector(client);
    restoreGenderCollector(client);

    client.user.setActivity({
        name: '🧩 Oyunlar/Eğlence/Moderasyon: /help',
    });
});


client.commands = new Collection();
client.config = require('./config.json');

module.exports = client;

client.login(client.config.token).then(() => {
    loadEvents(client);
    loadCommands(client);
});
// reactor

const reactor = require('./Models/Reactor')
client.on(Events.MessageCreate, async (message) => {
    const data = await reactor.findOne({ Guild: message.guild.id, Channel: message.channel.id });
    if (!data) return;
    else {
        if (message.author.bot) return;
        message.react(data.Emoji);
        message.react(data.Emoji2);
    }
})

const Ticket = require('./Models/Ticket');

// anket

const pollschema = require('./Models/Votes');

client.on(Events.InteractionCreate, async i => {

    if (!i.guild) return;
    if (!i.message) return;
    if (!i.isButton) return;

    const data = await pollschema.findOne({ Guild: i.guild.id, Msg: i.message.id });
    if (!data) return;
    const msg = await i.channel.messages.fetch(data.Msg);

    if (Date.now() > data.EndTime) {
        return await i.reply({ content: 'Anket sona erdi, oy kullanamazsınız.', ephemeral: true });
    }

    const timeLeft = data.EndTime - Date.now();
    const minutesLeft = Math.floor(timeLeft / 60000);
    const secondsLeft = Math.floor((timeLeft % 60000) / 1000);

    let footerText = `📊 Anket sona ermesine kalan süre: ${minutesLeft}:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;

    if (i.customId === 'up') {
        if (data.UpMembers.includes(i.user.id)) return await i.reply({ content: 'Tekrar oy kullanamazsın! Zaten olumlu yönde oy kullandın.', ephemeral: true });

        let downvotes = data.Downvote;
        if (data.DownMembers.includes(i.user.id)) {
            downvotes = downvotes - 1;
        }

        const newembed = EmbedBuilder.from(msg.embeds[0])
            .setFields(
                { name: '👍', value: `**${data.Upvote + 1}**  Oy`, inline: true },
                { name: '👎', value: `**${downvotes}** Oy`, inline: true }
            )
            .setFooter({ text: footerText, iconURL: client.user.displayAvatarURL() });

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('up')
                    .setLabel('👍')
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId('down')
                    .setLabel('👎')
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId('votes')
                    .setLabel('Oylar')
                    .setStyle(ButtonStyle.Secondary),
            );

        await i.update({ embeds: [newembed], components: [buttons] });

        data.Upvote++;

        if (data.DownMembers.includes(i.user.id)) {
            data.Downvote = data.Downvote - 1;
        }

        data.UpMembers.push(i.user.id);
        data.DownMembers.pull(i.user.id);
        data.save();
    }

    if (i.customId === 'down') {
        if (data.DownMembers.includes(i.user.id)) return await i.reply({ content: 'Tekrar oy kullanamazsın! Zaten olumsuz yönde oy kullandın.', ephemeral: true });

        let upvotes = data.Upvote;
        if (data.UpMembers.includes(i.user.id)) {
            upvotes = upvotes - 1;
        }

        const newembed = EmbedBuilder.from(msg.embeds[0])
            .setFields(
                { name: '👍', value: `**${upvotes}**  Oy`, inline: true },
                { name: '👎', value: `**${data.Downvote + 1}** Oy`, inline: true }
            )
            .setFooter({ text: footerText, iconURL: client.user.displayAvatarURL() });

        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('up')
                    .setLabel('👍')
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId('down')
                    .setLabel('👎')
                    .setStyle(ButtonStyle.Danger),

                new ButtonBuilder()
                    .setCustomId('votes')
                    .setLabel('Oylar')
                    .setStyle(ButtonStyle.Secondary),
            );

        await i.update({ embeds: [newembed], components: [buttons] });

        data.Downvote++;

        if (data.UpMembers.includes(i.user.id)) {
            data.Upvote = data.Upvote - 1;
        }

        data.DownMembers.push(i.user.id);
        data.UpMembers.pull(i.user.id);
        data.save();
    }

    if (i.customId === 'votes') {
        let upvoters = [];
        data.UpMembers.forEach(member => {
            upvoters.push(`<@${member}>`);
        });

        let downvoters = [];
        data.DownMembers.forEach(member => {
            downvoters.push(`<@${member}>`);
        });

        const embed = new EmbedBuilder()
            .setColor("Green")
            .setAuthor({ name: '📊 Anket sistemi' })
            .setFooter({ text: footerText, iconURL: client.user.displayAvatarURL() })
            .setTimestamp()
            .setTitle('📊 Anket Oyları')
            .addFields({ name: `👍 (${upvoters.length})`, value: `${upvoters.join(', ').slice(0, 1020) || 'Oy yok!'}`, inline: true })
            .addFields({ name: `👎 (${downvoters.length})`, value: `${downvoters.join(', ').slice(0, 1020) || 'Oy yok!'}`, inline: true })

        await i.reply({ embeds: [embed], ephemeral: true });
    }
});
