const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });
const dotenv = require('dotenv');

dotenv.config({ path: './keys.env' });

const sendMessage = async (channel_id, option) => {
  await lib.discord.channels['@0.3.2'].messages.create({
    "channel_id": channel_id,
    "content": "",
    "tts": false,
    "embeds": [
      {
        "type": "rich",
        "title": "Rewritten Text",
        "description": "\nExample body of rewritten text.",
        "color": 0x00FFFF,
        "author": {
          "name": "Undetectable AI",
          "url": "https://undetectable.ai?fpr=yws1m",
          "icon_url": "https://s3-eu-west-1.amazonaws.com/tpd/logos/647716caa164d7a66fa3e796/0x0.png"
        },
        "footer": {
          "text": `Rewritten using ${option}`
        }
      }
    ]
  });
};

module.exports = {
  sendMessage
};