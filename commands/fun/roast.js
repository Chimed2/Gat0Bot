const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roast')
        .setDescription('Roast a user (SFW only).')
        .addUserOption(option => option.setName('user').setDescription('User to roast').setRequired(true)),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const roasts = [
            "You're as useless as the 'ueue' in 'queue'.",
            "You have something on your chin... no, the third one down.",
            "You're not stupid; you just have bad luck thinking.",
            "You're the reason the gene pool needs a lifeguard.",
            "If I had a dollar for every smart thing you said, I'd be broke."
        ];
        const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
        await interaction.reply(`${user}, ${randomRoast}`);
    },
};
