const http = require('node:http');
const createApp = require('./app');
const { attachWebSocketServer } = require('./ws');
const { port } = require('./config');

const app = createApp();
const server = http.createServer(app);
attachWebSocketServer(server);

server.listen(port, () => {
  console.log(`Chat-App server listening on port ${port}`);
});

module.exports = server;
