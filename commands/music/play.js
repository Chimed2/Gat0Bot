const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, NoSubscriberBehavior, AudioPlayerStatus } = require('@discordjs/voice');
const play = require('play-dl');
const { getQueue, setQueue, deleteQueue } = require('../../utils/musicQueue');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('playmusic')
        .setDescription('Play music from YouTube/Spotify')
        .addStringOption(option => option.setName('url').setDescription('URL or Search Query').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        
        const channel = interaction.member.voice.channel;
        if (!channel) {
            return interaction.followup('❌ You must be in a voice channel.');
        }

        const query = interaction.options.getString('url');
        
        
        let serverQueue = getQueue(interaction.guild.id);

        if (!serverQueue) {
            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: interaction.guild.id,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause,
                },
            });

            serverQueue = {
                connection,
                player,
                songs: [],
                playing: false
            };
            
            setQueue(interaction.guild.id, serverQueue);
            
            player.on(AudioPlayerStatus.Idle, () => {
                serverQueue.songs.shift();
                if (serverQueue.songs.length > 0) {
                    playSong(interaction.guild.id, serverQueue.songs[0]);
                } else {
                    serverQueue.playing = false;
                }
            });
            
            connection.subscribe(player);
        }

        
        let songInfo;
        try {
            if (query.includes('spotify')) {
                if (play.is_expired()) await play.refreshToken();
                let sp_data = await play.spotify(query);
                
                if (sp_data.type === 'track') {
                     songInfo = { title: `${sp_data.artists[0].name} - ${sp_data.name}`, url: query, duration: sp_data.durationInSec };
                } else {
                    return interaction.followup('❌ Only Spotify tracks are supported right now.');
                }
            } else {
                const search = await play.search(query, { limit: 1 });
                if (search.length === 0) return interaction.followup('❌ No results found.');
                songInfo = { title: search[0].title, url: search[0].url, duration: search[0].durationInSec };
            }
        } catch (e) {
            console.error(e);
            return interaction.followup(`❌ Error searching: ${e.message}`);
        }

        serverQueue.songs.push(songInfo);

        if (!serverQueue.playing) {
            playSong(interaction.guild.id, serverQueue.songs[0]);
            interaction.followup(`🎶 Now playing: **${songInfo.title}**`);
        } else {
            interaction.followup(`📝 Added to queue: **${songInfo.title}**`);
        }
    },
};

async function playSong(guildId, song) {
    const serverQueue = getQueue(guildId);
    if (!serverQueue) return;

    try {
        let stream;
        if (song.url.includes('spotify')) {
            const searched = await play.search(song.title, { limit: 1 }); 
             stream = await play.stream(searched[0].url);
        } else {
             stream = await play.stream(song.url);
        }

        const resource = createAudioResource(stream.stream, { inputType: stream.type });
        serverQueue.player.play(resource);
        serverQueue.playing = true;
    } catch (error) {
        console.error(error);
        
        serverQueue.songs.shift();
        if (serverQueue.songs.length > 0) playSong(guildId, serverQueue.songs[0]);
    }
}
