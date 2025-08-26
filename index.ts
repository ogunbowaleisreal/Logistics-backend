import { config } from "dotenv";
config();

import { createServer } from "http";
import app from "./src/app";
import logger from "./logger";

const server = createServer(app);

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});
