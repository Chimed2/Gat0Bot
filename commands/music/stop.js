const { SlashCommandBuilder } = require('discord.js');
const { getQueue, deleteQueue } = require('../../utils/musicQueue');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stopmusic')
        .setDescription('Stop the music and disconnect.'),
    async execute(interaction) {
        const serverQueue = getQueue(interaction.guild.id);

        if (serverQueue) {
            serverQueue.player.stop();
            serverQueue.connection.destroy();
            deleteQueue(interaction.guild.id);
            await interaction.reply("🛑 Music stopped and disconnected.");
        } else {
            await interaction.reply("❌ I'm not playing anything.");
        }
    },
};
