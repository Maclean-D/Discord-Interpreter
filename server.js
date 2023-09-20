const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');
const dotenv = require('dotenv');

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

dotenv.config({ path: './keys.env' });

app.post('/savePersonality', (req, res) => {
    const { personalityContent } = req.body;
    fs.writeFileSync('personality.txt', personalityContent);
    res.json({ message: 'Personality content saved!' });
});

app.post('/saveInstructions', (req, res) => {
    const { instructionsContent } = req.body;
    fs.writeFileSync('instructions.txt', instructionsContent);
    res.json({ message: 'Instructions content saved!' });
});

app.post('/saveEnvVars', (req, res) => {
    const { openaiToken, openaiOrg, discordToken } = req.body;
    fs.writeFileSync('keys.env', `OPENAI_TOKEN=${openaiToken}\nOPENAI_ORGANIZATION=${openaiOrg}\nDISCORD_TOKEN=${discordToken}`);
    res.json({ message: 'Env vars saved!' });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'Settings.html'));
});

app.get('/getTextContent', (req, res) => {
    const personalityContent = fs.existsSync('personality.txt') ? fs.readFileSync('personality.txt', 'utf8') : '';
    const instructionsContent = fs.existsSync('instructions.txt') ? fs.readFileSync('instructions.txt', 'utf8') : '';
    res.json({ personalityContent, instructionsContent });
});

app.get('/getEnvVars', (req, res) => {
    const envVars = {
        openaiToken: process.env.OPENAI_TOKEN,
        openaiOrg: process.env.OPENAI_ORGANIZATION,
        discordToken: process.env.DISCORD_TOKEN,
    };
    res.json(envVars);
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
