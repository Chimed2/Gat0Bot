const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getModLogFolder, saveJson } = require('../../utils/storage');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('swarn')
        .setDescription('Warn a member silently (via DM)')
        .addUserOption(option => option.setName('user').setDescription('User to warn').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason');
        const guild = interaction.guild;

        try {
            await user.send(`⚠️ You were warned in **${guild.name}** for: ${reason}`);
        } catch (e) {}

        
        const modFolder = getModLogFolder(guild.name, user.tag);
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        
        
        
        
        saveJson(path.join(modFolder, `warn_${timestamp}.json`), {
            user: user.tag,
            moderator: interaction.user.tag,
            action: "warn",
            reason: reason,
            timestamp: timestamp
        });

        await interaction.reply({ content: '✅ User has been warned (DM sent).', ephemeral: true });
    },
};
