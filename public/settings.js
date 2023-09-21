// Add event listener for document loaded
document.addEventListener("DOMContentLoaded", function() {
  // Function declaration to handle button click events
  const handleClick = (buttonId, textIndex) => {
    document.getElementById(buttonId).addEventListener("click", function() {
      let content = document.querySelectorAll('textarea')[textIndex].value;
      alert(`Changed content to: ${content}`);
      // Add your code to save the content
    });
  };

  // Call handleClick function for each button
  handleClick("savePersonality", 0);
  handleClick("saveInstructions", 1);
});
  

// Add event listener for document loaded
document.addEventListener("DOMContentLoaded", function() {
  fetch('/getTextContent')
    .then(res => res.json())
    .then(data => {
      document.querySelectorAll('textarea')[0].value = data.personalityContent;
      document.querySelectorAll('textarea')[1].value = data.instructionsContent;
    });

  fetch('/getEnvVars')
    .then(res => res.json())
    .then(data => {
      document.getElementById('openAIKey').value = data.openaiToken;
      document.getElementById('openAIOrg').value = data.openaiOrg;
      document.getElementById('discordToken').value = data.discordToken;
      
      const discordBotTokenTitle = document.getElementById('discordBotTokenTitle');
      const botName = data.discordBotName ? `Connected to ${data.discordBotName}` : '';
      discordBotTokenTitle.innerText = `Discord Bot Token: (${botName})`;
    });

  // Save content 
  const saveContent = (id, endpoint, content) => {
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content)
    })
    .then(res => res.json())
    .then(data => console.log(data.message));
  };

  ['savePersonality', 'saveInstructions'].forEach((id) => {
    document.getElementById(id).addEventListener("click", function() {
      const content = document.querySelectorAll('textarea')[id === 'savePersonality' ? 0 : 1].value;
      saveContent(id, `/${id}`, { [`${id === 'savePersonality' ? 'personalityContent' : 'instructionsContent'}`]: content });
    });
  });

  ['saveOpenAIKey', 'saveOpenAIOrg', 'saveDiscordToken'].forEach((id) => {
    document.getElementById(id).addEventListener("click", function() {
      const openaiToken = document.getElementById('openAIKey').value;
      const openaiOrg = document.getElementById('openAIOrg').value;
      const discordToken = document.getElementById('discordToken').value;
      saveContent(id, '/saveEnvVars', { openaiToken, openaiOrg, discordToken });
    });
  });

  // Reload Environment Variables
  document.getElementById("reloadEnvButton").addEventListener("click", function() {
    fetch('/reloadEnvVars')
        .then(res => res.json())
        .then(data => {
            console.log(data.message);
            // Refresh environment variable fields after reloading
            fetch('/getEnvVars')
                .then(res => res.json())
                .then(data => {
                    document.getElementById('openAIKey').value = data.openaiToken;
                    document.getElementById('openAIOrg').value = data.openaiOrg;
                    document.getElementById('discordToken').value = data.discordToken;
                });
        });
  });

  // Clear Console
  document.getElementById("clearConsoleButton").addEventListener("click", function() {
    const logger = document.getElementById('consoleOutput');
    logger.innerHTML = "";
    console.log('🗑️ Console cleared');
  });

  // Stop Server
  document.getElementById("stopServerButton").addEventListener("click", function() {
    console.log('🛑 Server stopped.');
    fetch('/stopServer');
  });
});

// Capture console output
(function() {
  const oldLog = console.log;
  const logger = document.getElementById('consoleOutput');
  console.log = function(message) {
    if (typeof message === 'object') {
      logger.innerHTML += (JSON && JSON.stringify ? JSON.stringify(message) : message) + '<br />';
    } else {
      logger.innerHTML += message + '<br />';
    }
    oldLog.apply(arguments);
  };
})();

// WebSocket Connection for Console Output
const ws = new WebSocket('ws://localhost:3000');

ws.addEventListener('open', function(event) {
  console.log('🌐WebSocket connected.');
});

ws.addEventListener('message', function(event) {
  console.log(event.data);
});