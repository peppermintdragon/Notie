import { createServer } from 'http';
import app from './app.js';
import { env } from './config/env.js';
import { initSocket } from './socket/index.js';
import { logger } from './utils/logger.js';

const server = createServer(app);

// Initialize Socket.io
initSocket(server);

server.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`);
  logger.info(`Client URL: ${env.CLIENT_URL}`);
});
