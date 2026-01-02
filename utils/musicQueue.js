const queue = new Map();

module.exports = {
    getQueue: (guildId) => queue.get(guildId),
    setQueue: (guildId, q) => queue.set(guildId, q),
    deleteQueue: (guildId) => queue.delete(guildId),
};
