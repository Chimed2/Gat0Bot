const { loadJson, saveJson, getLevelFile, getLevelSettingsFile } = require('./storage');

const cooldowns = new Map();

const addXp = async (message) => {
    if (message.author.bot || !message.guild) return;

    const guildName = message.guild.name;
    const settingsPath = getLevelSettingsFile(guildName);
    const settings = loadJson(settingsPath);

    if (!settings.server_leveling_enabled) return;

    const userId = message.author.id;
    const now = Date.now();
    const cooldownAmount = (settings.cooldown || 60) * 1000;

    if (cooldowns.has(userId)) {
        const expirationTime = cooldowns.get(userId) + cooldownAmount;
        if (now < expirationTime) return;
    }

    cooldowns.set(userId, now);

    const levelFile = getLevelFile(guildName, userId);
    const userData = loadJson(levelFile, { xp: 0, level: 1 });

    userData.xp += 10; 
    const newLevel = Math.floor(Math.sqrt(userData.xp / 10));

    if (newLevel > userData.level) {
        userData.level = newLevel;
        try {
            await message.author.send(`🎉 You leveled up to **Level ${newLevel}** in **${guildName}**!`);
        } catch (e) {
            
        }
    }

    saveJson(levelFile, userData);
};

module.exports = { addXp };
