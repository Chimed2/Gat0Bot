const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const path = require('path');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('airhorn')
        .setDescription('Play airhorn in your VC.'),
    async execute(interaction) {
        const channel = interaction.member.voice.channel;
        if (!channel) return interaction.reply({ content: "❌ You're not in a voice channel.", ephemeral: true });

        const filePath = path.join(__dirname, '../../airhorn.mp3');
        if (!fs.existsSync(filePath)) return interaction.reply({ content: "❌ airhorn.mp3 not found in bot root.", ephemeral: true });

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: interaction.guild.id,
            adapterCreator: interaction.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        const resource = createAudioResource(filePath);

        connection.subscribe(player);
        player.play(resource);

        await interaction.reply("AIRHORN BLASTED 🔊");

        player.on(AudioPlayerStatus.Idle, () => {
            connection.destroy();
        });
    },
};
