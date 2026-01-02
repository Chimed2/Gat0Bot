const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { UPLOAD_FOLDER } = require('../../utils/storage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('uploaddamn')
        .setDescription('Upload one or more damns (comma-separated links)')
        .addStringOption(option => option.setName('url').setDescription('URLs').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        const urls = interaction.options.getString('url').split(',').map(u => u.trim());
        const successful = [];
        const failed = [];

        for (const url of urls) {
            try {
                const urlObj = new URL(url);
                const filename = path.basename(urlObj.pathname);
                if (!filename || filename.length === 0) {
                    failed.append(`${url} (Invalid filename)`);
                    continue;
                }

                const response = await axios({
                    url,
                    method: 'GET',
                    responseType: 'stream'
                });

                const writer = fs.createWriteStream(path.join(UPLOAD_FOLDER, filename));
                response.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                successful.push(filename);
            } catch (error) {
                failed.push(`${url} (${error.message})`);
            }
        }

        let msg = "";
        if (successful.length > 0) msg += `✅ Uploaded: ${successful.join(', ')}\n`;
        if (failed.length > 0) msg += `❌ Failed:\n${failed.join('\n')}`;

        await interaction.followup(msg || "Something went wrong.");
    },
};
