const { Client, GatewayIntentBits, ActivityType, ContextMenuCommandBuilder, ApplicationCommandType } = require('discord.js');
const fs = require('fs');
const dotenv = require('dotenv');
const setupContextMenu = require('./contextmenus/contextmenu');

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
        
        // Read existing keys.env into an object
        const envConfig = dotenv.parse(fs.readFileSync('./keys.env'));

        // Update DISCORD_BOT_NAME
        envConfig.DISCORD_BOT_NAME = client.user.tag;

        // Convert the object back to string and write to keys.env
        const newEnvContent = Object.entries(envConfig)
            .map(([key, value]) => `${key}=${value}`)
            .join('\n');

        fs.writeFileSync('./keys.env', newEnvContent);
        console.log("👤 Updated bot name");

        client.user.setActivity('folding origami', { type: ActivityType.Watching });
        console.log(`👀 Activity set to watching 'folding origami'`);
        
        // Set up context menus
        setupContextMenu(client);
    });    

    client.login(token).catch(err => {
        console.error('🔴 Failed to connect to Discord:', err.message);
    });
};

const discordToken = process.env.DISCORD_TOKEN || '';
if (discordToken) {
    connectToDiscord(discordToken);
} else {
    console.error('🔴 No Discord bot token provided.');
}

module.exports = connectToDiscord;