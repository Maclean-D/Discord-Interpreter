// Add event listener for document loaded
document.addEventListener("DOMContentLoaded", function() {
  // Function declaration to handle button click events
  const handleClick = (buttonId, textIndex) => {
    document.getElementById(buttonId).addEventListener("click", function() {
      let content = document.querySelectorAll('textarea')[textIndex].value;
      alert(`Changed content to: ${content}`);
    });
  };

  // Call handleClick function for each button
  handleClick("savePersonality", 0);
  handleClick("saveInstructions", 1);

  // Fetch and autofill saved content and environment variables
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
      document.getElementById('undetectableAIKey').value = data.undetectableAIToken;
      document.getElementById('discordClientID').value = data.discordClientID;
    });

  // Save content to server
  const saveContent = (id, endpoint, content) => {
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content)
    })
    .then(res => res.json())
    .then(data => console.log(data.message));
  };

  // Auto-expand textarea
const textareas = document.querySelectorAll('textarea');
textareas.forEach(textarea => {
  textarea.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
  });
});

  // Add event listeners for saving text areas
  ['savePersonality', 'saveInstructions'].forEach((id) => {
    document.getElementById(id).addEventListener("click", function() {
      const content = document.querySelectorAll('textarea')[id === 'savePersonality' ? 0 : 1].value;
      saveContent(id, `/${id}`, { [`${id === 'savePersonality' ? 'personalityContent' : 'instructionsContent'}`]: content });
    });
  });

  // Add event listeners for saving API keys
  ['saveOpenAIKey', 'saveOpenAIOrg', 'saveDiscordToken', 'saveDiscordClientID', 'saveUndetectableAI'].forEach((id) => {
    document.getElementById(id).addEventListener("click", function() {
      const openaiToken = document.getElementById('openAIKey').value;
      const openaiOrg = document.getElementById('openAIOrg').value;
      const discordToken = document.getElementById('discordToken').value;
      const discordClientID = document.getElementById('discordClientID').value;
      const undetectableAIToken = document.getElementById('undetectableAIKey').value;
      saveContent(id, '/saveEnvVars', { openaiToken, openaiOrg, discordToken, discordClientID, undetectableAIToken });
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
                    document.getElementById('undetectableAIKey').value = data.undetectableAIToken;
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
  const oldError = console.error;
  const oldWarn = console.warn;
  const logger = document.getElementById('consoleOutput');

  function logToDiv(message, type) {
    if (typeof message === 'object') {
      logger.innerHTML += `<span class="${type}">${JSON && JSON.stringify ? JSON.stringify(message) : message}</span><br />`;
    } else {
      logger.innerHTML += `<span class="${type}">${message}</span><br />`;
    }
  }

  console.log = function(message) {
    logToDiv(message, 'log');
    oldLog.apply(console, arguments);
  };

  console.error = function(message) {
    logToDiv(message, 'error');
    oldError.apply(console, arguments);
  };

  console.warn = function(message) {
    logToDiv(message, 'warn');
    oldWarn.apply(console, arguments);
  };
})();

// WebSocket Connection for Console Output
const ws = new WebSocket('ws://localhost:3000');

ws.addEventListener('open', function(event) {
  console.log('🌐 WebSocket connected.');
});

ws.addEventListener('message', function(event) {
  console.log(event.data);
});