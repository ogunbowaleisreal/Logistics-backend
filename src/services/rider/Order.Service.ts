import { Order } from "../../models/Order.Model";
import { Rider } from "../../models/Rider.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModel } from "../../utilities/Pagination.Helper";
import { tenantScope } from "../../utilities/TenantScope";
import { redisClient } from "../../config/cache";
import { orderStatusUpdateEventEmitter } from "../../utilities/OrderStatusEvent";
import { sendOrderStatusSMS } from "../../utilities/OrderStatusSMS";

const RIDER_ALLOWED_TRANSITIONS: Record<string, string[]> = {
  approved: ["processing"],
  processing: ["in-transit"],
  "in-transit": ["processing", "delivered"],
};

export class OrderService {
  public async getMyOrders(
    riderId: string,
    businessId: string,
    queryParams: any,
  ) {
    const { status, page, limit } = queryParams;
    const query: any = tenantScope({ riderID: riderId }, businessId);

    if (status) {
      query.status = status;
    }

    return paginateModel(Order, query, Number(page) || 1, Number(limit) || 10, {
      createdAt: -1,
    });
  }

  public async updateOrderStatus(
    riderId: string,
    businessId: string,
    orderId: string,
    status: string,
  ) {
    const existingOrder = await Order.findOne(
      tenantScope({ _id: orderId, riderID: riderId }, businessId),
    );

    if (!existingOrder) {
      throw new AppError(404, "Order not found");
    }

    const allowedTransitions =
      RIDER_ALLOWED_TRANSITIONS[existingOrder.status] ?? [];

    if (!allowedTransitions.includes(status)) {
      throw new AppError(
        400,
        `Invalid status transition: ${existingOrder.status} → ${status}`,
      );
    }

    const order = await Order.findOneAndUpdate(
      tenantScope({ _id: orderId, riderID: riderId }, businessId),
      { status },
      { new: true },
    );

    if (!order) {
      throw new AppError(404, "Order not found");
    }

    if (status === "delivered") {
      await Promise.all([
        Rider.findByIdAndUpdate(riderId, { $inc: { totalDeliveries: 1 } }),
        redisClient.del(`rider-stats:${riderId}`),
      ]);
    }

    orderStatusUpdateEventEmitter.emit("rider-update-order-status", {
      riderId,
      orderStatus: status,
      orderTrackingID: order.trackingID,
    });

    void sendOrderStatusSMS(order, status);

    return order;
  }
}
