const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const { getBalance } = require('../../utils/economy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your wallet balance.')
        .addUserOption(option => option.setName('user').setDescription('User to check')),
    async execute(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const balance = getBalance(user.id);

        const embed = new EmbedBuilder()
            .setTitle(`💳 ${user.username}'s Balance`)
            .setDescription(`**${balance} gat0bucks**`)
            .setColor(Colors.Blue);

        await interaction.reply({ embeds: [embed] });
    },
};
