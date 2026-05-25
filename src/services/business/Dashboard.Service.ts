import { Types } from "mongoose";
import { Business } from "../../models/Business.Model";
import { Order } from "../../models/Order.Model";
import { redisClient } from "../../config/cache";

export type DashboardFilter = "today" | "week" | "month";

const FIVE_MINUTES_IN_SECONDS = 300;

const TRACKED_STATUSES = ["pending", "in-transit", "delivered", "canceled"];

function getDateBoundaries() {
  const now = new Date();
  const todayStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  const dayOfWeek = todayStart.getUTCDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  const weekStart = new Date(todayStart);
  weekStart.setUTCDate(weekStart.getUTCDate() - daysSinceMonday);

  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );

  return { todayStart, weekStart, monthStart };
}

export class DashboardService {
  public async getStats(businessId: string, filter: DashboardFilter) {
    const cacheKey = `business-dashboard:${businessId}:${filter}`;
    const cached = await redisClient.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const { todayStart, weekStart, monthStart } = getDateBoundaries();

    const filterStart =
      filter === "today"
        ? todayStart
        : filter === "week"
          ? weekStart
          : monthStart;

    const businessObjectId = new Types.ObjectId(businessId);

    const [aggregation, business] = await Promise.all([
      Order.aggregate([
        { $match: { businessId: businessObjectId } },
        {
          $facet: {
            totalAmount: [
              {
                $match: {
                  status: { $nin: ["canceled", "failed", "pending"] },
                },
              },
              { $group: { _id: null, sum: { $sum: "$amount" } } },
            ],
            totalOrdersToday: [
              { $match: { createdAt: { $gte: todayStart } } },
              { $count: "count" },
            ],
            totalOrdersThisWeek: [
              { $match: { createdAt: { $gte: weekStart } } },
              { $count: "count" },
            ],
            totalOrdersThisMonth: [
              { $match: { createdAt: { $gte: monthStart } } },
              { $count: "count" },
            ],
            orderStatusBreakdown: [
              {
                $match: {
                  createdAt: { $gte: filterStart },
                  status: { $in: TRACKED_STATUSES },
                },
              },
              { $group: { _id: "$status", count: { $sum: 1 } } },
            ],
          },
        },
      ]),
      Business.findById(businessId).select("wallet"),
    ]);

    const facet = aggregation[0] ?? {};

    const statusMap: Record<string, number> = Object.fromEntries(
      TRACKED_STATUSES.map((s) => [s, 0]),
    );
    for (const entry of facet.orderStatusBreakdown ?? []) {
      statusMap[entry._id] = entry.count;
    }

    const result = {
      currentBalance: business?.wallet?.naira ?? 0,
      totalAmount: facet.totalAmount?.[0]?.sum ?? 0,
      totalOrdersToday: facet.totalOrdersToday?.[0]?.count ?? 0,
      totalOrdersThisWeek: facet.totalOrdersThisWeek?.[0]?.count ?? 0,
      totalOrdersThisMonth: facet.totalOrdersThisMonth?.[0]?.count ?? 0,
      orderStatusBreakdown: {
        filter,
        ...statusMap,
      },
    };

    await redisClient.setEx(cacheKey, FIVE_MINUTES_IN_SECONDS, JSON.stringify(result));

    return result;
  }
}
