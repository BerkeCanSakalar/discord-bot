const { Collection } = require('discord.js');

const cooldowns = new Collection();
const messageCounts = new Collection();

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (message.author.bot) return;

        const userId = message.author.id;
        const cooldownTime = 3000;
        const maxMessages = 6;

        if (!messageCounts.has(userId)) {
            messageCounts.set(userId, 1);
            cooldowns.set(userId, Date.now());
        } else {
            const lastMessageTime = cooldowns.get(userId);
            const timeDifference = Date.now() - lastMessageTime;

           
            if (timeDifference > cooldownTime) {
                messageCounts.set(userId, 1);
                cooldowns.set(userId, Date.now());
            } else {
                
                const messageCount = messageCounts.get(userId) + 1;
                messageCounts.set(userId, messageCount);

                
                if (messageCount >= maxMessages) {
                    try {
                        await message.delete();
                    } catch (error) {
                        if (error.code !== 10008) {
                            console.error('Mesaj silinemedi:', error);
                        }
                    }
                    return message.channel.send(`${message.author}, lütfen spam yapma!`);
                }
            }
        }
    },
};
