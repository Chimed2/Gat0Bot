const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getModLogFolder, saveJson } = require('../../utils/storage');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sban')
        .setDescription('Silently ban a member')
        .addUserOption(option => option.setName('user').setDescription('User to ban').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    async execute(interaction) {
        const user = interaction.options.getMember('user');
        const reason = interaction.options.getString('reason');

        if (!user) {
             return interaction.reply({ content: 'User not found in this guild.', ephemeral: true });
        }
        
        if (!user.bannable) {
             return interaction.reply({ content: 'I cannot ban this user.', ephemeral: true });
        }

        await user.ban({ reason: reason });

        const modFolder = getModLogFolder(interaction.guild.name, user.user.tag);
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        
        saveJson(path.join(modFolder, `ban_${timestamp}.json`), {
            user: user.user.tag,
            moderator: interaction.user.tag,
            action: "ban",
            reason: reason,
            timestamp: timestamp
        });

        await interaction.reply({ content: '✅ User has been banned.', ephemeral: true });
    },
};
