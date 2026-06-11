import { Types } from "mongoose";
import { Business } from "../../models/Business.Model";
import { Order } from "../../models/Order.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModel } from "../../utilities/Pagination.Helper";

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

export class BusinessService {
  public async getBusinesses(filter: any) {
    const { businessId, search, status, plan, page, limit } = filter;

    if (businessId) {
      const business = await Business.findOne({
        _id: businessId,
        isDeleted: false,
      });
      if (!business) {
        throw new AppError(404, "Business not found");
      }
      return business;
    }

    const query: any = { isDeleted: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (plan) {
      query.plan = plan;
    }

    return paginateModel(Business, query, page, limit);
  }

  public async updateBusinessStatus(
    businessId: string,
    status: "active" | "suspended",
  ) {
    const business = await Business.findOne({
      _id: businessId,
      isDeleted: false,
    });

    if (!business) {
      throw new AppError(404, "Business not found");
    }

    if (business.status === status) {
      throw new AppError(400, `Business already ${status}`);
    }

    business.status = status;
    await business.save();

    return business;
  }

  public async getBusinessStats(businessId: string) {
    const { todayStart, weekStart, monthStart } = getDateBoundaries();

    const [business, aggregation] = await Promise.all([
      Business.findOne({ _id: businessId, isDeleted: false }).select("wallet"),
      Order.aggregate([
        { $match: { businessId: new Types.ObjectId(businessId) } },
        {
          $facet: {
            totalRevenue: [
              {
                $match: {
                  status: { $nin: ["canceled", "failed", "pending"] },
                },
              },
              { $group: { _id: null, sum: { $sum: "$amount" } } },
            ],
            totalOrders: [{ $count: "count" }],
            ordersToday: [
              { $match: { createdAt: { $gte: todayStart } } },
              { $count: "count" },
            ],
            ordersThisWeek: [
              { $match: { createdAt: { $gte: weekStart } } },
              { $count: "count" },
            ],
            ordersThisMonth: [
              { $match: { createdAt: { $gte: monthStart } } },
              { $count: "count" },
            ],
            orderStatusBreakdown: [
              { $match: { status: { $in: TRACKED_STATUSES } } },
              { $group: { _id: "$status", count: { $sum: 1 } } },
            ],
          },
        },
      ]),
    ]);

    if (!business) {
      throw new AppError(404, "Business not found");
    }

    const facet = aggregation[0] ?? {};

    const statusMap: Record<string, number> = Object.fromEntries(
      TRACKED_STATUSES.map((s) => [s, 0]),
    );
    for (const entry of facet.orderStatusBreakdown ?? []) {
      statusMap[entry._id] = entry.count;
    }

    return {
      walletBalance: business.wallet?.naira ?? 0,
      totalRevenue: facet.totalRevenue?.[0]?.sum ?? 0,
      totalOrders: facet.totalOrders?.[0]?.count ?? 0,
      ordersByPeriod: {
        today: facet.ordersToday?.[0]?.count ?? 0,
        thisWeek: facet.ordersThisWeek?.[0]?.count ?? 0,
        thisMonth: facet.ordersThisMonth?.[0]?.count ?? 0,
      },
      orderStatusBreakdown: statusMap,
    };
  }

  public async deleteBusiness(businessId: string) {
    const business = await Business.findOneAndUpdate(
      { _id: businessId, isDeleted: false },
      { isDeleted: true },
    );

    if (!business) {
      throw new AppError(404, "Business not found");
    }

    return;
  }
}
