const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const { getGlobalLeaderboard } = require('../../utils/economy');
const { getLevelSettingsFile, loadJson, DATA_DIR, safeFileName } = require('../../utils/storage');
const path = require('path');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View top users')
        .addSubcommand(sub => 
            sub.setName('xp')
               .setDescription('View Server XP Leaderboard')
        )
        .addSubcommand(sub => 
            sub.setName('economy')
               .setDescription('View Global Economy Leaderboard')
        ),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'xp') {
            await handleXpLeaderboard(interaction);
        } else if (subcommand === 'economy') {
            await handleEconomyLeaderboard(interaction);
        }
    },
};

async function handleEconomyLeaderboard(interaction) {
    const leaderboard = getGlobalLeaderboard();
    const embed = new EmbedBuilder()
        .setTitle('🌍 Global Economy Leaderboard')
        .setColor(Colors.Gold);

    
    const top = leaderboard.slice(0, 10);
    if (top.length === 0) {
        embed.setDescription("No data yet.");
        return interaction.reply({ embeds: [embed] });
    }

    let desc = "";
    for (let i = 0; i < top.length; i++) {
        const entry = top[i];
        let name = `User ${entry.userId}`;
        
        try {
            const user = await interaction.client.users.fetch(entry.userId);
            name = user.username;
        } catch (e) {}
        
        desc += `**${i + 1}.** ${name}: **${entry.balance}** gat0bucks\n`;
    }
    embed.setDescription(desc);
    await interaction.reply({ embeds: [embed] });
}

async function handleXpLeaderboard(interaction) {
    const guildName = interaction.guild.name;
    const settingsPath = getLevelSettingsFile(guildName);
    const settings = loadJson(settingsPath);

    if (!settings.server_leveling_enabled) {
        return interaction.reply({ content: "❌ This server does not have leveling enabled.", ephemeral: true });
    }

    const usrFolder = path.join(DATA_DIR, 'srvlevels', safeFileName(guildName), 'usrlevels');
    if (!fs.existsSync(usrFolder)) {
         return interaction.reply({ content: "❌ No data found.", ephemeral: true });
    }

    const leaderboard = [];
    const userDirs = fs.readdirSync(usrFolder);

    for (const userId of userDirs) {
        const lvlPath = path.join(usrFolder, userId, 'lvl.json');
        if (fs.existsSync(lvlPath)) {
            const data = loadJson(lvlPath);
            leaderboard.push({ id: userId, xp: data.xp || 0 });
        }
    }

    leaderboard.sort((a, b) => b.xp - a.xp);

    const embed = new EmbedBuilder()
        .setTitle(`🏆 XP Leaderboard - ${guildName}`)
        .setColor(Colors.Blue);

    let desc = "";
    for (let i = 0; i < Math.min(10, leaderboard.length); i++) {
        const entry = leaderboard[i];
        let name = `User ${entry.id}`;
        try {
            const member = await interaction.guild.members.fetch(entry.id);
            name = member.user.username;
        } catch (e) {}
        
        desc += `**${i + 1}.** ${name}: **${entry.xp}** XP\n`;
    }
    embed.setDescription(desc || "No users found.");

    await interaction.reply({ embeds: [embed] });
}
