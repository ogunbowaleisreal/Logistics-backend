import { Order } from "../../models/Order.Model";
import { EmailService } from "../Email.Service";
import AppError from "../../utilities/ErrorHandler";
import { paginateModelWithMultiplePopulates } from "../../utilities/Pagination.Helper";
import { tenantScope } from "../../utilities/TenantScope";

const emailService = new EmailService();

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ["in-transit", "canceled"],
  "in-transit": ["delivered", "canceled"],
  delivered: [],
  canceled: [],
};

export class OrderService {
  public async getOrders(businessId: string, payload: any) {
    const { orderID, bankID, riderID, status, search, page, limit } = payload;

    if (orderID) {
      const order = await Order.findOne(
        tenantScope({ _id: orderID }, businessId),
      );
      if (!order) {
        throw new AppError(404, "Order not found");
      }
      return order;
    }

    const query: any = {};
    if (riderID) {
      query.riderID = riderID;
    }
    if (status) {
      query.status = status;
    }
    if (bankID) {
      query.bankID = bankID;
    }
    if (search) {
      query.$or = [
        {
          "personnelInformation.sender.name": { $regex: search, $options: "i" },
        },
        {
          "personnelInformation.sender.email": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "personnelInformation.sender.phone": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "personnelInformation.receiver.name": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "personnelInformation.receiver.phone": {
            $regex: search,
            $options: "i",
          },
        },
        { trackingID: { $regex: search, $options: "i" } },
      ];
    }

    const scopedQuery = tenantScope(query, businessId);

    const orders = await paginateModelWithMultiplePopulates(
      Order,
      scopedQuery,
      page,
      limit,
      [
        {
          path: "riderID",
          select: "name phone",
        },
        {
          path: "bankID",
          select: "name accountName accountNumber",
        },
      ],
    );

    return orders;
  }

  public async updateOrderStatus(businessId: string, payload: any) {
    const { orderID, status } = payload;

    const existingOrder = await Order.findOne(
      tenantScope({ _id: orderID }, businessId),
    );

    if (!existingOrder) {
      throw new AppError(404, "Order not found");
    }

    const allowedTransitions = ALLOWED_TRANSITIONS[existingOrder.status] ?? [];

    if (!allowedTransitions.includes(status)) {
      throw new AppError(
        400,
        `Invalid status transition: ${existingOrder.status} → ${status}`,
      );
    }

    const order = await Order.findOneAndUpdate(
      tenantScope({ _id: orderID }, businessId),
      { status },
      { new: true },
    );

    if (!order) {
      throw new AppError(404, "Order not found");
    }

    if (order.personnelInformation.sender.email) {
      void emailService.sendOrderStatusUpdate({
        email: order.personnelInformation.sender.email,
        name: order.personnelInformation.sender.name,
        trackingID: order.trackingID,
        status: order.status,
      });
    }

    return order;
  }
}
