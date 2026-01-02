const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const { addBalance, getCooldown, setCooldown } = require('../../utils/economy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily gat0bucks!'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const lastDaily = getCooldown(userId, 'lastDaily');
        const now = new Date();
        const cooldownTime = 24 * 60 * 60 * 1000; 

        if (lastDaily && (now - lastDaily) < cooldownTime) {
            const remaining = cooldownTime - (now - lastDaily);
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            return interaction.reply({ content: `🕒 You can claim your daily in **${hours}h ${minutes}m**.`, ephemeral: true });
        }

        const amount = Math.floor(Math.random() * 200) + 100; 
        addBalance(userId, amount);
        setCooldown(userId, 'lastDaily');

        const embed = new EmbedBuilder()
            .setTitle('💰 Daily Reward')
            .setDescription(`You claimed **${amount} gat0bucks**!`)
            .setColor(Colors.Gold);

        await interaction.reply({ embeds: [embed] });
    },
};
