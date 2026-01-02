const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getLevelSettingsFile, saveJson, loadJson } = require('../../utils/storage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leveling')
        .setDescription('Manage server leveling')
        .addSubcommand(sub => 
            sub.setName('enable')
               .setDescription('Enable leveling system for this server')
        )
        .addSubcommand(sub => 
            sub.setName('cooldown')
               .setDescription('Set XP gain cooldown')
               .addIntegerOption(opt => opt.setName('seconds').setDescription('Seconds').setRequired(true))
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const guildName = interaction.guild.name;
        const settingsPath = getLevelSettingsFile(guildName);
        const settings = loadJson(settingsPath);

        if (subcommand === 'enable') {
            settings.server_leveling_enabled = true;
            saveJson(settingsPath, settings);
            await interaction.reply({ content: `✅ Leveling system enabled for **${guildName}**!`, ephemeral: true });
        } else if (subcommand === 'cooldown') {
            if (!settings.server_leveling_enabled) {
                return interaction.reply({ content: '❌ Leveling must be enabled first.', ephemeral: true });
            }
            const seconds = interaction.options.getInteger('seconds');
            settings.cooldown = Math.max(10, Math.min(86400, seconds));
            saveJson(settingsPath, settings);
            await interaction.reply({ content: `⏱️ XP cooldown set to ${settings.cooldown} seconds.`, ephemeral: true });
        }
    },
};
