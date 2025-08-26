import { createClient } from "redis";
import logger from "../../logger";

const redisServerURL = process.env.REDIS_SERVER_URL;
export const redisClient = createClient({ url: redisServerURL });

const cacheConnection = async () => {
  try {
    await redisClient.connect();
  } catch (error: any) {
    logger.error(error.message);
    process.exit(1);
  }
};

export default cacheConnection;
