const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getModLogFolder, saveJson } = require('../../utils/storage');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skick')
        .setDescription('Silently kick a member')
        .addUserOption(option => option.setName('user').setDescription('User to kick').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Reason').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    async execute(interaction) {
        const user = interaction.options.getMember('user'); 
        const reason = interaction.options.getString('reason');
        
        if (!user) {
            return interaction.reply({ content: 'User not found in this guild.', ephemeral: true });
        }

        if (!user.kickable) {
             return interaction.reply({ content: 'I cannot kick this user.', ephemeral: true });
        }

        await user.kick(reason);

        
        const modFolder = getModLogFolder(interaction.guild.name, user.user.tag);
        const timestamp = new Date().toISOString().replace(/:/g, '-');
        
        saveJson(path.join(modFolder, `kick_${timestamp}.json`), {
            user: user.user.tag,
            moderator: interaction.user.tag,
            action: "kick",
            reason: reason,
            timestamp: timestamp
        });

        await interaction.reply({ content: '✅ User has been kicked.', ephemeral: true });
    },
};
