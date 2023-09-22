const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const { Server } = require('ws');
const connectToDiscord = require('./discord');

const app = express();
const wss = new Server({ noServer: true });

// Load environment variables
dotenv.config({ path: './keys.env' });

// Middleware setup
app.use(bodyParser.json());
app.use(express.static('public'));

// WebSocket setup
wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
    });
});

// HTTP setup
app.server = app.listen(3000, () => {
    console.log('As long as this window is open the bot will be online. Open the configuration page at http://localhost:3000');
});

app.server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

// Endpoint to save personality content
app.post('/savePersonality', (req, res) => {
    const { personalityContent } = req.body;
    fs.writeFileSync('personality.txt', personalityContent);
    res.json({ message: '🧑‍💻 Personality content saved!' });
});

// Endpoint to save instructions content
app.post('/saveInstructions', (req, res) => {
    const { instructionsContent } = req.body;
    fs.writeFileSync('instructions.txt', instructionsContent);
    res.json({ message: '📜 Instructions content saved!' });
});

// Endpoint to save environment variables
app.post('/saveEnvVars', (req, res) => {
    const { openaiToken, openaiOrg, discordToken, discordClientID, undetectableAIToken } = req.body;
    fs.writeFileSync('keys.env', `OPENAI_TOKEN=${openaiToken}\nOPENAI_ORGANIZATION=${openaiOrg}\nDISCORD_TOKEN=${discordToken}\nDISCORD_CLIENT_ID=${discordClientID}\nUNDETECTABLE_AI_TOKEN=${undetectableAIToken}`);
    console.log("Saved env vars:", openaiToken, openaiOrg, discordToken, undetectableAIToken); // Added undetectableAIToken
    if (discordToken) {
        connectToDiscord(discordToken);  
    }
    res.json({ message: '💾 Environment variables saved & reloaded' });
});

// Endpoint to fetch environment variables
app.get('/getEnvVars', (req, res) => {
    const envConfig = dotenv.parse(fs.readFileSync('keys.env'));
    res.json({
        openaiToken: envConfig.OPENAI_TOKEN,
        openaiOrg: envConfig.OPENAI_ORGANIZATION,
        discordToken: envConfig.DISCORD_TOKEN,
        discordClientID: envConfig.DISCORD_CLIENT_ID,
        undetectableAIToken: envConfig.UNDETECTABLE_AI_TOKEN // New line for Undetectable AI
    });
});

// Endpoint to reload environment variables
app.get('/reloadEnvVars', (req, res) => {
    dotenv.config({ path: './keys.env' });
    res.json({ message: '🔄️ Environment variables reloaded' });
});

// Default endpoint to serve the settings page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Settings.html'));
});

// Endpoint to fetch text content
app.get('/getTextContent', (req, res) => {
    const personalityContent = fs.existsSync('personality.txt') ? fs.readFileSync('personality.txt', 'utf8') : '';
    const instructionsContent = fs.existsSync('instructions.txt') ? fs.readFileSync('instructions.txt', 'utf8') : '';
    res.json({ personalityContent, instructionsContent });
});

// Endpoint to stop the server
app.get('/stopServer', (req, res) => {
  console.log("🛑 Server is stopping.");
  res.json({ message: '🛑 Server stopped' });
  process.exit(0); // Stops the Node.js process
});