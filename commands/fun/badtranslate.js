const { SlashCommandBuilder } = require('discord.js');
const { translate } = require('google-translate-api-x');


const languages = ['en', 'es', 'fr', 'de', 'ja', 'ko', 'zh-CN', 'ru', 'it', 'pt'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('badtranslate')
        .setDescription('Translate a word multiple times through random languages.')
        .addStringOption(option => option.setName('word').setDescription('The word to translate').setRequired(true))
        .addIntegerOption(option => option.setName('iterations').setDescription('Number of translations (10-100)').setMinValue(10).setMaxValue(100).setRequired(true)), 
    async execute(interaction) {
        const word = interaction.options.getString('word');
        const iterations = interaction.options.getInteger('iterations');

        await interaction.deferReply();
        let current = word;

        try {
            const progressMsg = await interaction.followup('🔄 Starting bad translation...');

            for (let i = 0; i < iterations; i++) {
                const lang = languages[Math.floor(Math.random() * languages.length)];
                try {
                    const res = await translate(current, { to: lang });
                    current = res.text;
                } catch (e) {
                    console.error(e);
                    
                }

                
                if ((i + 1) % 5 === 0 || i === iterations - 1) {
                    await interaction.editReply(`Translating... ${i + 1}/${iterations}`);
                }
            }
            
            
             try {
                const finalRes = await translate(current, { to: 'en' });
                current = finalRes.text;
            } catch (e) {}

            await interaction.editReply(`✅ **Bad Translation Result (${iterations}x):**\n${current}`);
        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ An error occurred during translation.');
        }
    },
};
