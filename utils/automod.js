const fs = require('fs');
const path = require('path');
const { DATA_DIR, safeFileName } = require('./storage');

const getAutoDeleteWords = (guildName) => {
    const folder = path.join(DATA_DIR, 'auto stuff', safeFileName(guildName), 'autodelete');
    if (!fs.existsSync(folder)) return [];
    return fs.readdirSync(folder)
        .filter(f => f.endsWith('.json'))
        .map(f => f.slice(0, -5)); 
};

const getAutoMuteWords = (guildName) => {
    const folder = path.join(DATA_DIR, 'auto stuff', safeFileName(guildName), 'automute');
    if (!fs.existsSync(folder)) return {};
    const words = {};
    fs.readdirSync(folder).forEach(file => {
        if (file.endsWith('.json')) {
            try {
                const data = JSON.parse(fs.readFileSync(path.join(folder, file), 'utf8'));
                words[data.word] = data.duration || 60;
            } catch (e) {}
        }
    });
    return words;
};

module.exports = { getAutoDeleteWords, getAutoMuteWords };
