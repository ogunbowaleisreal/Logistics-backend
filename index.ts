import { config } from "dotenv";
config();

import { createServer } from "http";
import app from "./src/app";
import logger from "./logger";

const server = createServer(app);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  const mem = process.memoryUsage();
  console.log(`RSS: ${(mem.rss / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Heap Used: ${(mem.heapUsed / 1024 / 1024).toFixed(1)} MB`);
  console.log(`Modules loaded: ${Object.keys(require.cache).length}`);
});
