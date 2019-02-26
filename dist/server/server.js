const fs = require('fs');
const { Tail } = require('tail');
const WebSocket = require('ws');

const logFileName = process.argv[2];

if (!logFileName) {
  console.error('Error: Filename argument is required');
  process.exit(1);
}

if (!fs.existsSync(logFileName)) {
  console.error(`Error: file does not exist:`, logFileName);
  process.exit(1);
}

const server = new WebSocket.Server({ host: '127.0.0.1', port: 4000 });
console.log(`Listening for client connections...`);
server.on('connection', _ => {
  console.log('client connected,', 'total:', server.clients.size);
});


new Tail(logFileName).on('line', broadcastLine);

function broadcastLine(line) {
  server.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN)
      client.send(line)
  });
}
