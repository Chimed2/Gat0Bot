const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Roll a single dice'),
    async execute(interaction) {
        const result = Math.floor(Math.random() * 6) + 1;
        const embed = new EmbedBuilder()
            .setTitle('🎲 Dice Roll')
            .setDescription(`You rolled a **${result}**!`)
            .setColor(Colors.Green);
        await interaction.reply({ embeds: [embed] });
    },
};
