const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('damnhelp')
        .setDescription('DMs you help on how to use the damn commands'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const embed1 = new EmbedBuilder()
            .setTitle("💡 Help for Damn")
            .setDescription("This command helps you with damn, and how to use it.")
            .setColor(Colors.Blurple);

        const embed2 = new EmbedBuilder()
            .setTitle("🖼️ Upload Damn Bird")
            .setDescription("To upload a damn bird, get an image link and use `/uploaddamn`.")
            .setColor(Colors.Green);

        const embed3 = new EmbedBuilder()
            .setTitle("🎲 How to Get a Random Damn Bird Meme")
            .setDescription("Run `/randomdamn` to get a random image.")
            .setColor(Colors.Orange);

        try {
            await interaction.user.send({ embeds: [embed1, embed2, embed3] });
            await interaction.followup('📬 Sent you a DM with help!');
        } catch (error) {
            await interaction.followup('❌ I can\'t DM you! Please enable DMs from server members.');
        }
    },
};
