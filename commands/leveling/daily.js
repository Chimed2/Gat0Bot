const { SlashCommandBuilder } = require('discord.js');
const { getLevelFile, loadJson, saveJson, safeFileName, DATA_DIR } = require('../../utils/storage');
const path = require('path');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dailyxp')
        .setDescription('Claim daily XP (requires level 5)'),
    async execute(interaction) {
        const guildName = interaction.guild.name;
        const userId = interaction.user.id;
        const levelFile = getLevelFile(guildName, userId);

        if (!fs.existsSync(levelFile)) {
             return interaction.reply({ content: "❌ You haven't earned any XP yet!", ephemeral: true });
        }

        const data = loadJson(levelFile);
        if ((data.level || 1) < 5) {
             return interaction.reply({ content: "🔒 You are not yet level 5.", ephemeral: true });
        }

        const claimPath = path.join(DATA_DIR, 'srvlevels', safeFileName(guildName), 'usrlevels', userId, 'daily.json');
        const now = new Date();
        const dailyData = loadJson(claimPath, { last: "1970-01-01T00:00:00.000Z" });
        const lastClaim = new Date(dailyData.last);

        if ((now - lastClaim) < 86400000) { 
             return interaction.reply({ content: "🕒 You have already claimed your daily XP today.", ephemeral: true });
        }

        const dailyXp = data.level * 25;
        data.xp += dailyXp;
        
        
        const newLevel = Math.floor(Math.sqrt(data.xp / 10));
        if (newLevel > data.level) {
            data.level = newLevel;
            try {
                await interaction.user.send(`🎉 You leveled up to **Level ${newLevel}** in **${guildName}**!`);
            } catch (e) {}
        }

        saveJson(levelFile, data);
        saveJson(claimPath, { last: now.toISOString() });

        await interaction.reply({ content: `✅ You gained **${dailyXp} XP**!`, ephemeral: true });
    },
};
