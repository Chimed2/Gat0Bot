const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const { addBalance, removeBalance, getBalance, getCooldown, setCooldown } = require('../../utils/economy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('steal')
        .setDescription('Attempt to steal from another user.')
        .addUserOption(option => option.setName('user').setDescription('The victim').setRequired(true)),
    async execute(interaction) {
        const victim = interaction.options.getUser('user');
        const thief = interaction.user;

        if (victim.id === thief.id) {
            return interaction.reply({ content: "You can't steal from yourself!", ephemeral: true });
        }

        const lastSteal = getCooldown(thief.id, 'lastSteal');
        const now = new Date();
        const cooldownTime = 2 * 60 * 60 * 1000; 

        if (lastSteal && (now - lastSteal) < cooldownTime) {
            const remaining = cooldownTime - (now - lastSteal);
            const minutes = Math.floor(remaining / (1000 * 60));
            return interaction.reply({ content: `👮 Lay low! You can steal again in **${minutes}m**.`, ephemeral: true });
        }

        const victimBal = getBalance(victim.id);
        const thiefBal = getBalance(thief.id);

        if (victimBal < 20) {
            return interaction.reply({ content: `🛑 ${victim.username} is too poor to steal from!`, ephemeral: true });
        }

        setCooldown(thief.id, 'lastSteal');

        
        if (Math.random() < 0.4) {
            const amount = Math.floor(Math.random() * (victimBal * 0.2)) + 1; 
            removeBalance(victim.id, amount);
            addBalance(thief.id, amount);

            const embed = new EmbedBuilder()
                .setTitle('🔫 Heist Successful')
                .setDescription(`You stole **${amount} gat0bucks** from ${victim}!`)
                .setColor(Colors.Green);
            return interaction.reply({ embeds: [embed] });
        } else {
            
            const fine = Math.max(50, Math.floor(thiefBal * 0.1));
            removeBalance(thief.id, fine);

            const embed = new EmbedBuilder()
                .setTitle('🚔 Busted!')
                .setDescription(`You got caught stealing from ${victim} and paid a fine of **${fine} gat0bucks**.`)
                .setColor(Colors.Red);
            return interaction.reply({ embeds: [embed] });
        }
    },
};
