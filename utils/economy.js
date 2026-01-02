const fs = require('fs');
const path = require('path');
const { DATA_DIR, loadJson, saveJson } = require('./storage');

const ECONOMY_FILE = path.join(DATA_DIR, 'economy.json');


if (!fs.existsSync(ECONOMY_FILE)) {
    saveJson(ECONOMY_FILE, {});
}

const getEconomyData = () => loadJson(ECONOMY_FILE);
const saveEconomyData = (data) => saveJson(ECONOMY_FILE, data);

const getUserData = (userId) => {
    const data = getEconomyData();
    
    if (!data[userId]) {
        data[userId] = {
            balance: 0,
            bank: 0,
            bankLimit: 1000,
            debt: 0,
            education: 0, 
            lastDaily: null,
            lastWork: null,
            lastSteal: null,
            lastCrime: null,
            lastPayment: new Date().toISOString(), 
            arrested: false,
            hunterActive: false
        };
        saveEconomyData(data);
    }
    
    if (data[userId].bank === undefined) {
        data[userId].bank = 0;
        data[userId].bankLimit = 1000;
        data[userId].debt = 0;
        data[userId].education = 0;
        data[userId].arrested = false;
        data[userId].lastPayment = new Date().toISOString();
        saveEconomyData(data);
    }
    return data[userId];
};

const updateUserData = (userId, updates) => {
    const data = getEconomyData();
    if (!data[userId]) getUserData(userId); 
    data[userId] = { ...data[userId], ...updates };
    saveEconomyData(data);
    return data[userId];
};

const addBalance = (userId, amount) => {
    const data = getEconomyData();
    if (!data[userId]) getUserData(userId);
    data[userId].balance += amount;
    saveEconomyData(data);
    return data[userId].balance;
};

const removeBalance = (userId, amount) => {
    const data = getEconomyData();
    if (!data[userId]) getUserData(userId);
    data[userId].balance = Math.max(0, data[userId].balance - amount);
    saveEconomyData(data);
    return data[userId].balance;
};

const wipeUser = (userId) => {
    const data = getEconomyData();
    if (data[userId]) {
        delete data[userId];
        saveEconomyData(data);
    }
};

const setCooldown = (userId, type) => {
    updateUserData(userId, { [type]: new Date().toISOString() });
};

const getCooldown = (userId, type) => {
    const data = getUserData(userId);
    return data[type] ? new Date(data[type]) : null;
};

const getGlobalLeaderboard = () => {
    const data = getEconomyData();
    return Object.entries(data)
        .map(([userId, stats]) => ({ 
            userId, 
            balance: (stats.balance || 0) + (stats.bank || 0) - (stats.debt || 0) 
        }))
        .sort((a, b) => b.balance - a.balance);
};

module.exports = {
    getUserData,
    updateUserData,
    addBalance,
    removeBalance,
    wipeUser,
    setCooldown,
    getCooldown,
    getGlobalLeaderboard
};