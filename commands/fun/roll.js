const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Roll 3 random numbers (1-7)'),
    async execute(interaction) {
        const rolls = Array.from({ length: 3 }, () => Math.floor(Math.random() * 7) + 1);
        const embed = new EmbedBuilder()
            .setTitle('🎰 Roll')
            .setDescription(`Results: ${rolls.join(' | ')}`)
            .setColor(Colors.Purple);
        await interaction.reply({ embeds: [embed] });
    },
};
