const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: './keys.env' });

let client;

const connectToDiscord = (token) => {
    if (client) {
        client.destroy();
    }
    client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            // Add more intents based on your bot's needs
        ],
    });

    client.once('ready', () => {
        console.log(`🤖 Connected to Discord as ${client.user.tag}`);
        fs.appendFileSync('keys.env', `\nDISCORD_BOT_NAME=${client.user.tag}`);
    });    

    client.login(token).catch(err => {
        console.error('🔴Failed to connect to Discord:', err.message);
    });
};

const discordToken = process.env.DISCORD_TOKEN || '';
if (discordToken) {
    connectToDiscord(discordToken);
} else {
    console.error('🔴No Discord bot token provided.');
}

module.exports = connectToDiscord;