const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const { getLevelFile, loadJson } = require('../../utils/storage');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Check your current level and XP'),
    async execute(interaction) {
        const guildName = interaction.guild.name;
        const member = interaction.user;
        const levelFile = getLevelFile(guildName, member.id);

        if (!fs.existsSync(levelFile)) {
            return interaction.reply({ content: "❌ You haven't earned any XP yet!", ephemeral: true });
        }

        const data = loadJson(levelFile);
        const xp = data.xp || 0;
        const level = data.level || 1;
        const nextXp = Math.pow(level + 1, 2) * 10;

        const embed = new EmbedBuilder()
            .setTitle(`📊 ${member.username}'s Rank`)
            .setDescription(`**Level:** ${level}\n**XP:** ${xp} / ${nextXp}`)
            .setColor(Colors.Gold);

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};
