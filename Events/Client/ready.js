const mongoose = require('mongoose');
const config = require('../../config.json');
const Levels = require('discord.js-leveling');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        mongoose.set("strictQuery", false);
        mongoose.connection.on('error', err => {
            console.error('MongoDB bağlantı hatası:', err);
        });
        mongoose.connection.once('open', () => {
            console.log('MongoDB Bağlantısı Başarılı');
        });

        Levels.setURL(config.mongodb);

        console.log(`${client.user.username} aktif`);

        try {
            await mongoose.connect(config.mongodb || '', {
                
            });
        } catch (error) {
            console.error('MongoDB bağlantı hatası:', error);
        }
    }
}