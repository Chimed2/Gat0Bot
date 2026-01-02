const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { UPLOAD_FOLDER } = require('../../utils/storage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomdamn')
        .setDescription('Send a random file from the damns folder'),
    async execute(interaction) {
        await interaction.deferReply();

        fs.readdir(UPLOAD_FOLDER, (err, files) => {
            if (err || files.length === 0) {
                return interaction.followup('❌ No damns uploaded yet.');
            }

            const randomFile = files[Math.floor(Math.random() * files.length)];
            const filePath = path.join(UPLOAD_FOLDER, randomFile);

            interaction.followup({ files: [filePath] });
        });
    },
};
