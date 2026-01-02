const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const UPLOAD_FOLDER = path.join(DATA_DIR, 'damns');


if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(UPLOAD_FOLDER)) fs.mkdirSync(UPLOAD_FOLDER);

const safeFileName = (name) => name.replace(/[\/\\?%*:|"<>]/g, '_');


const loadJson = (filePath, defaultValue = {}) => {
    try {
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error(`Error reading ${filePath}:`, e);
    }
    return defaultValue;
};


const saveJson = (filePath, data) => {
    try {
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    } catch (e) {
        console.error(`Error writing ${filePath}:`, e);
    }
};


const getLevelFile = (guildName, userId) => {
    return path.join(DATA_DIR, 'srvlevels', safeFileName(guildName), 'usrlevels', userId, 'lvl.json');
};

const getLevelSettingsFile = (guildName) => {
    return path.join(DATA_DIR, 'srvlevels', safeFileName(guildName), 'setting.json');
};


const getModLogFolder = (guildName, userTag) => {
    return path.join(DATA_DIR, 'modlogs', safeFileName(guildName), safeFileName(userTag));
};

const getAutoMuteFile = (guildName, word) => {
    return path.join(DATA_DIR, 'auto stuff', safeFileName(guildName), 'automute', `${safeFileName(word)}.json`);
};


module.exports = {
    loadJson,
    saveJson,
    getLevelFile,
    getLevelSettingsFile,
    getModLogFolder,
    getAutoMuteFile,
    DATA_DIR,
    UPLOAD_FOLDER,
    safeFileName
};
