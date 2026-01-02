const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const { addBalance, removeBalance, getUserData, setCooldown, getCooldown } = require('../../utils/economy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('crime')
        .setDescription('Commit a high-risk crime.'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const data = getUserData(userId);

        if (data.arrested) return interaction.reply({ content: "🚔 You are already in jail!", ephemeral: true });

        const lastCrime = getCooldown(userId, 'lastCrime');
        const now = new Date();
        if (lastCrime && (now - lastCrime) < 30 * 60 * 1000) { 
            return interaction.reply({ content: "🕒 Cool down, the heat is still on!", ephemeral: true });
        }

        setCooldown(userId, 'lastCrime');

        
        
        const netWorth = data.balance + data.bank;
        const risk = Math.min(40, Math.floor(netWorth / 1000) * 2);
        const successChance = Math.max(0.1, 0.5 - (risk / 100));

        if (Math.random() < successChance) {
            const gain = Math.floor(Math.random() * 500) + 200;
            addBalance(userId, gain);
            return interaction.reply(`💸 You successfully robbed a local store and got **${gain} gat0bucks**!`);
        } else {
            
            const loss = Math.floor(netWorth * 0.2) + 100;
            removeBalance(userId, loss);
            
            
            if (Math.random() < 0.3) {
                const { updateUserData } = require('../../utils/economy');
                updateUserData(userId, { arrested: true });
                return interaction.reply(`🚔 **BUSTED!** You lost **${loss}** and have been **arrested**! (Use /bank repay to clear debt if any, or wait)`);
            }

            return interaction.reply(`❌ You failed the heist and lost **${loss}** while fleeing!`);
        }
    },
};
