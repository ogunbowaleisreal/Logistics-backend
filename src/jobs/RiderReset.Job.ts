import cron, { ScheduledTask } from "node-cron";
import logger from "../../logger";
import { Rider } from "../models/Rider.Model";

export const startRiderResetJob = (): ScheduledTask => {
  return cron.schedule("0 0 * * *", async () => {
    try {
      const result = await Rider.updateMany(
        { isDeleted: false },
        { $set: { todaysRideCount: 0 } },
      );

      logger.info("Rider daily reset completed", {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      });
    } catch (error: any) {
      logger.error("Rider daily reset failed", {
        error: error.message,
        stack: error.stack,
      });
    }
  });
};
