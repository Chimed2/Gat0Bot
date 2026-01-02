require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, REST, Routes } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();
const commands = [];


const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        } else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}


const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

client.login(process.env.DISCORD_TOKEN);


const express = require('express');
const app = express();


app.use(express.static(path.join(__dirname, 'website')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'website', 'index.html'));
});

app.get('/commands', (req, res) => {
    res.sendFile(path.join(__dirname, 'website', 'commands.html'));
});

app.get('/tos', (req, res) => {
    res.sendFile(path.join(__dirname, 'website', 'termsofservice.html'));
});


const DOMAIN = 'gat0bot.duckdns.org';
const MAINTAINER_EMAIL = 'chimed698@gmail.com'; 

if (process.env.NODE_ENV === 'production') {
    require('greenlock-express').init({
        packageRoot: __dirname,
        configDir: './greenlock.d',
        maintainerEmail: MAINTAINER_EMAIL,
        cluster: false,
        
        
        app: app
    }).ready(function (glx) {
        const httpsServer = glx.httpsServer();
        
        console.log(`🔒 Website served at https://${DOMAIN}`);
    }).serve(httpsServer => {
         
    });
} else {
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🌐 Website running at http://localhost:${PORT}`);
        console.log(`ℹ️  To enable HTTPS for ${DOMAIN}, set NODE_ENV=production and run with sudo (for ports 80/443).`);
    });
}
