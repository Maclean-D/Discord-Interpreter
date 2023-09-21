const { ContextMenuCommandBuilder, ApplicationCommandType, REST, Routes } = require('discord.js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: './keys.env' });
const { DISCORD_CLIENT_ID, DISCORD_TOKEN } = process.env;

const setupContextMenu = async (client) => {
    const rest = new REST().setToken(DISCORD_TOKEN);

    // Delete all existing global commands
    await rest.put(Routes.applicationCommands(DISCORD_CLIENT_ID), { body: [] })
        .then(() => console.log('🗑️ Successfully deleted all application commands.'))
        .catch(console.error);

    const options = [
        'General Writing',
        'Essay',
        'Story',
        'Article',
        'Marketing Material',
    ];

    // Create new context menus based on the options
    for (const option of options) {
        const data = new ContextMenuCommandBuilder()
            .setName(`[ud] ${option}`)
            .setType(ApplicationCommandType.Message);
        
        await client.application.commands.create(data);
        console.log(`🚀 Context menu for ${option} successfully created`);
    }

    // Handle interaction for context menus
    client.on('interactionCreate', interaction => {
        if (!interaction.isMessageContextMenuCommand()) return;

        const { content } = interaction.targetMessage;
        const option = interaction.commandName.replace('[ud] ', '');

        console.log(`✍️ Context menu ${option} selected`);
        console.log(`💬 message id for context menu ${content}`);

        // Your logic to handle each context menu type goes here
    });
};

module.exports = setupContextMenu;