const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('membercount')
        .setDescription('Get the number of server members'),
    async execute(interaction) {
        const count = interaction.guild.memberCount;
        const embed = new EmbedBuilder()
            .setTitle('👥 Member Count')
            .setDescription(`This server has **${count}** members.`)
            .setColor(Colors.Blue);
        await interaction.reply({ embeds: [embed] });
    },
};
