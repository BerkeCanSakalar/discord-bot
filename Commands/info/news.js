const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const config = require('../../config.json');
const ServerSettings = require('../../Models/ServerSettings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('haberler')
        .setDescription('Güncel haber başlıklarını gösterir')
        .addStringOption(option => 
            option.setName('country')
                .setDescription('Haberler için ülke kodu (örneğin: us, tr, gb)')
                .setRequired(true)),
    async execute(interaction) {
        const country = interaction.options.getString('country');

        try {
            const newsResponse = await axios.get(`https://newsapi.org/v2/top-headlines?country=${country}&apiKey=${config.newsApiKey}`);
            const news = newsResponse.data.articles.slice(0, 5); // İlk 5 haberi al

            if (news.length === 0) {
                return interaction.reply({ content: 'Bu ülke için güncel haber bulunamadı.', ephemeral: true });
            }

            // Haberler embed tasarımı
            const newsEmbed = new EmbedBuilder()
                .setColor('#FF4500')
                .setTitle('📰 Güncel Haberler')
                .setDescription(`**${country.toUpperCase()}** ülkesindeki en son haberler:`)
                .setFooter({ text: 'NewsAPI tarafından sağlanmaktadır', iconURL: 'https://newsapi.org/images/n-logo-border.png' })
                .setTimestamp();

            news.forEach((article, index) => {
                newsEmbed.addFields(
                    { name: `${index + 1}. ${article.title}`, value: `[Haberi oku](${article.url})` }
                );
            });

            await interaction.reply({ embeds: [newsEmbed] });
        } catch (error) {
            console.error('Haberler komutu sırasında bir hata oluştu:', error);
            await interaction.reply({
                content: 'Haberleri alırken bir hata oluştu. Lütfen geçerli bir ülke kodu girin veya daha sonra tekrar deneyin.',
                ephemeral: true
            });
        }
    },
};
