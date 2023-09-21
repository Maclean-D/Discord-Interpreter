const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');
const { Server } = require('ws');
const connectToDiscord = require('./discord');

const app = express();
const wss = new Server({ noServer: true });

dotenv.config({ path: './keys.env' });

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

app.post('/savePersonality', (req, res) => {
    const { personalityContent } = req.body;
    fs.writeFileSync('personality.txt', personalityContent);
    res.json({ message: '🧑‍💻Personality content saved!' });
});

app.post('/saveInstructions', (req, res) => {
    const { instructionsContent } = req.body;
    fs.writeFileSync('instructions.txt', instructionsContent);
    res.json({ message: '📜Instructions content saved!' });
});

app.post('/saveEnvVars', (req, res) => {
    const { openaiToken, openaiOrg, discordToken } = req.body;
    fs.writeFileSync('keys.env', `OPENAI_TOKEN=${openaiToken}\nOPENAI_ORGANIZATION=${openaiOrg}\nDISCORD_TOKEN=${discordToken}`);
    console.log("Saved env vars:", openaiToken, openaiOrg, discordToken);
    if (discordToken) {
        connectToDiscord(discordToken);  
    }
    res.json({ message: '💾Environment variables saved & reloaded' });
});

app.get('/getEnvVars', (req, res) => {
    const envConfig = dotenv.parse(fs.readFileSync('keys.env'));
    console.log("Fetching env vars:", envConfig);
    res.json({
        openaiToken: envConfig.OPENAI_TOKEN,
        openaiOrg: envConfig.OPENAI_ORGANIZATION,
        discordToken: envConfig.DISCORD_TOKEN,
        discordBotName: envConfig.DISCORD_BOT_NAME
    });
});

app.get('/reloadEnvVars', (req, res) => {
    dotenv.config({ path: './keys.env' });
    res.json({ message: '🔄️Environment variables reloaded' });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Settings.html'));
});

app.get('/getTextContent', (req, res) => {
    const personalityContent = fs.existsSync('personality.txt') ? fs.readFileSync('personality.txt', 'utf8') : '';
    const instructionsContent = fs.existsSync('instructions.txt') ? fs.readFileSync('instructions.txt', 'utf8') : '';
    res.json({ personalityContent, instructionsContent });
});

app.get('/stopServer', (req, res) => {
  console.log("🛑 Server is stopping.");
  res.json({ message: '🛑 Server stopped' });
  process.exit(0); // Stops the Node.js process
});