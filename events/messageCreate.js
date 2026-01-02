const { Events } = require('discord.js');
const { getAutoDeleteWords, getAutoMuteWords } = require('../utils/automod');
const { addXp } = require('../utils/leveling');
const { saveJson, getModLogFolder } = require('../utils/storage');
const path = require('path');

const mutes = new Map(); 

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot || !message.guild) return;

        const content = message.content.toLowerCase();
        const deleteWords = getAutoDeleteWords(message.guild.name);
        const muteWords = getAutoMuteWords(message.guild.name);

        
        for (const word of deleteWords) {
            if (content.includes(word)) {
                await message.delete().catch(() => {});
                await message.channel.send(`${message.author}, that word is not allowed.`);
                return;
            }
        }

        
        for (const [word, duration] of Object.entries(muteWords)) {
            if (content.includes(word)) {
                let role = message.guild.roles.cache.find(r => r.name === "Muted");
                if (!role) {
                    try {
                        role = await message.guild.roles.create({
                            name: "Muted",
                            permissions: []
                        });
                        message.guild.channels.cache.forEach(async (channel) => {
                            await channel.permissionOverwrites.create(role, { SendMessages: false });
                        });
                    } catch (e) {
                        console.error("Failed to create Muted role:", e);
                    }
                }

                if (role) {
                    await message.member.roles.add(role);
                    
                    
                    const modFolder = getModLogFolder(message.guild.name, message.author.tag);
                    const timestamp = new Date().toISOString().replace(/:/g, '-');
                    saveJson(path.join(modFolder, `automute_${timestamp}.json`), {
                        user: message.author.tag,
                        moderator: "System",
                        action: "automute",
                        reason: `Used: ${word}`,
                        timestamp: timestamp
                    });

                    await message.delete().catch(() => {});
                    await message.channel.send(`${message.author}, you have been muted for ${duration}s for using a forbidden word.`);

                    
                    setTimeout(async () => {
                        if (message.member && role) {
                            await message.member.roles.remove(role).catch(() => {});
                        }
                    }, duration * 1000);
                }
                return;
            }
        }

        
        await addXp(message);

        
        const { getUserData, updateUserData, wipeUser } = require('../utils/economy');
        const data = getUserData(message.author.id);

        if (data.debt > 0) {
            const lastPayment = new Date(data.lastPayment);
            const now = new Date();
            const thirtyDays = 30 * 24 * 60 * 60 * 1000;

            
            if ((now - lastPayment) > thirtyDays && !data.arrested) {
                updateUserData(message.author.id, { arrested: true });
                await message.author.send("🚨 **BANK ALERT:** Your debt is over 30 days old. You have been **arrested** and your assets frozen! Use `/bank repay` to clear your debt.").catch(() => {});
            }

            
            if (data.arrested && (now - lastPayment) > (thirtyDays + (24 * 60 * 60 * 1000))) {
                
                if (Math.random() < 0.05) {
                    if (Math.random() < 0.5) {
                        
                        updateUserData(message.author.id, { lastPayment: now.toISOString() }); 
                        await message.channel.send(`⚔️ ${message.author}, **Bounty Hunters** sent by the bank attacked you, but you fought them off! They've retreated for now.`);
                    } else {
                        
                        wipeUser(message.author.id);
                        await message.channel.send(`💀 ${message.author}, **Bounty Hunters** caught up to you. You lost the fight and they seized **everything**. You are starting over from zero.`);
                    }
                }
            }
        }
    },
};
