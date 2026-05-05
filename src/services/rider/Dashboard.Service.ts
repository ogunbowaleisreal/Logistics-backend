import { Types } from "mongoose";
import { Order } from "../../models/Order.Model";
import { Rider } from "../../models/Rider.Model";
import { redisClient } from "../../config/cache";

interface RiderStats {
  today: number;
  thisWeek: number;
  last30Days: number;
  overall: number;
}

const SIX_HOURS_IN_SECONDS = 21600;

export class DashboardService {
  public async getStats(riderId: string): Promise<RiderStats> {
    const cacheKey = `rider-stats:${riderId}`;
    const cachedStats = await redisClient.get(cacheKey);

    if (cachedStats) {
      return JSON.parse(cachedStats) as RiderStats;
    }

    const now = new Date();
    const todayStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    const dayOfWeek = todayStart.getUTCDay();
    const daysSinceMonday = (dayOfWeek + 6) % 7;
    const weekStart = new Date(todayStart);
    weekStart.setUTCDate(weekStart.getUTCDate() - daysSinceMonday);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const riderObjectId = new Types.ObjectId(riderId);

    const [statsAggregation, rider] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            riderID: riderObjectId,
            status: "delivered",
          },
        },
        {
          $facet: {
            today: [
              { $match: { updatedAt: { $gte: todayStart } } },
              { $count: "count" },
            ],
            thisWeek: [
              { $match: { updatedAt: { $gte: weekStart } } },
              { $count: "count" },
            ],
            last30: [
              { $match: { updatedAt: { $gte: thirtyDaysAgo } } },
              { $count: "count" },
            ],
          },
        },
      ]),
      Rider.findById(riderId).select("totalDeliveries"),
    ]);

    const aggregatedStats = statsAggregation[0] ?? {};
    const result: RiderStats = {
      today: aggregatedStats.today?.[0]?.count ?? 0,
      thisWeek: aggregatedStats.thisWeek?.[0]?.count ?? 0,
      last30Days: aggregatedStats.last30?.[0]?.count ?? 0,
      overall: rider?.totalDeliveries ?? 0,
    };

    await redisClient.setEx(
      cacheKey,
      SIX_HOURS_IN_SECONDS,
      JSON.stringify(result),
    );

    return result;
  }
}
