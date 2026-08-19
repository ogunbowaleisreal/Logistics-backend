import { Order } from "../../models/Order.Model";
import { EmailService } from "../Email.Service";
import AppError from "../../utilities/ErrorHandler";
import { paginateModelWithPopulate } from "../../utilities/Pagination.Helper";
import { tenantScope } from "../../utilities/TenantScope";
import { startSession } from "mongoose";
import { Business } from "../../models/Business.Model";
import { Rider } from "../../models/Rider.Model";
import { riderAssignmentService } from "../RiderAssignment.Service";
import { BusinessConfigurationService } from "./BusinessConfiguration.Service";
import { redisClient } from "../../config/cache";
import { termiiService } from "../../utilities/Termii";
import { sendOrderStatusSMS } from "../../utilities/OrderStatusSMS";
import logger from "../../../logger";
import { orderStatusUpdateEventEmitter } from "../../utilities/OrderStatusEvent";
import { WhatsAppService, toWhatsAppNumber } from "../../utilities/Whatsapp.Services";
const emailService = new EmailService();
const whatsappService = new WhatsAppService();
const businessConfigurationService = new BusinessConfigurationService();

const VALID_STATUSES: string[] = [
  "pending",
  "paid",
  "approved",
  "processing",
  "in-transit",
  "delivered",
  "cancelled",
  "failed",
];

const LOCKED_RIDER_CHANGE_STATUSES = [
  "in-transit",
  "delivered",
  "canceled",
  "failed",
];

export class OrderService {
  public async getOrders(businessId: string, payload: any) {
    const { orderID, riderID, status, search, page, limit, from, to } =
      payload;

    if (orderID) {
      const order = await Order.findOne(
        tenantScope({ _id: orderID }, businessId),
      ).populate([
        {
          path: "riderID",
          select: "name phone",
        },
        {
          path: "zoneId",
          select: "name shippingType states destinationStates countries cities",
        },
      ]);
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
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = toDate;
      }
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

    const orders = await paginateModelWithPopulate(
      Order,
      scopedQuery,
      page,
      limit,
      { createdAt: -1 },
      [
        {
          path: "riderID",
          select: "name phone",
        },
        ,
        {
          path: "zoneId",
          select: "name shippingType states destinationStates countries cities",
        },
      ],
    );

    return orders;
  }

  public async updateOrderStatus(businessId: string, payload: any) {
    const { orderID, status } = payload;

    const session = await startSession();

    try {
      const order = await session.withTransaction(async () => {
        const existingOrder = await Order.findOne(
          tenantScope({ _id: orderID }, businessId),
        ).session(session);

        if (!existingOrder) {
          throw new AppError(404, "Order not found");
        }

        const { status: currentStatus } = existingOrder;

        if (currentStatus === status) {
          return existingOrder;
        }

        if (!VALID_STATUSES.includes(status)) {
          throw new AppError(400, "Invalid order status");
        }

        const order = await Order.findOneAndUpdate(
          tenantScope({ _id: orderID }, businessId),
          { status },
          { new: true, session },
        );

        if (!order) {
          throw new AppError(404, "Order not found");
        }

        if (status === "paid") {
          const business = await Business.findOneAndUpdate(
            { _id: order.businessId, isDeleted: false },
            { $inc: { "wallet.naira": order.amount } },
            { session },
          );

          if (!business) {
            throw new AppError(404, "Account not found");
          }
        }
        if (status === "approved") {
          const configuration = await businessConfigurationService.getConfiguration(
            order.businessId.toString(),
            session,
          );

          if (configuration.autoAssign) {
            await riderAssignmentService.assignRider(
              order.businessId.toString(),
              order,
              session,
            );
          }
        }

        await order.save({ session });

        return order;
      });

      orderStatusUpdateEventEmitter.emit("business-update-order-status", {
        businessId: businessId,
        orderStatus: order.status,
        orderTrackingID: order.trackingID,
      });

      const business = await Business.findById(businessId).lean();

      if (order.personnelInformation.sender.email) {
        void emailService.sendOrderStatusUpdate({
          email: order.personnelInformation.sender.email,
          name: order.personnelInformation.sender.name,
          trackingID: order.trackingID,
          status: order.status,
          businessName: business?.name,
          slug: business?.slug,
          amount: order.totalAmount
        });
      }

      void whatsappService.sendWhatsAppStatusNotification(order, business);

      void sendOrderStatusSMS(order, status, business?.name);

      if ((status === "delivered" || status === "canceled") && order.riderID) {
        void redisClient
          .del(`rider-stats:${order.riderID}`)
          .catch((error: any) =>
            logger.warn(error?.message || "Redis delete failed"),
          );
      }

      return order;
    } finally {
      await session.endSession();
    }
  }

  // ---- New private method, add it anywhere else inside the OrderService
  // class — e.g. right below updateOrderStatus, before getOrders or after it,
  // doesn't matter as long as it's a method on the same class. ----



  // public async updateOrderStatus(businessId: string, payload: any) {
  //   const { orderID, status } = payload;

  //   const session = await startSession();

  //   try {
  //     const order = await session.withTransaction(async () => {
  //       const existingOrder = await Order.findOne(
  //         tenantScope({ _id: orderID }, businessId),
  //       ).session(session);

  //       if (!existingOrder) {
  //         throw new AppError(404, "Order not found");
  //       }

  //       const { status: currentStatus } = existingOrder;

  //       if (currentStatus === status) {
  //         return existingOrder;
  //       }

  //       if (!VALID_STATUSES.includes(status)) {
  //         throw new AppError(400, "Invalid order status");
  //       }

  //       const order = await Order.findOneAndUpdate(
  //         tenantScope({ _id: orderID }, businessId),
  //         { status },
  //         { new: true, session },
  //       );

  //       if (!order) {
  //         throw new AppError(404, "Order not found");
  //       }

  //       if (status === "paid") {
  //         const business = await Business.findOneAndUpdate(
  //           { _id: order.businessId, isDeleted: false },
  //           { $inc: { "wallet.naira": order.amount } },
  //           { session },
  //         );

  //         if (!business) {
  //           throw new AppError(404, "Account not found");
  //         }
  //       }
  //       if (status === "approved") {
  //         const configuration = await businessConfigurationService.getConfiguration(
  //           order.businessId.toString(),
  //           session,
  //         );

  //         if (configuration.autoAssign) {
  //           await riderAssignmentService.assignRider(
  //             order.businessId.toString(),
  //             order,
  //             session,
  //           );
  //         }
  //       }

  //       await order.save({ session });

  //       return order;
  //     });

  //     orderStatusUpdateEventEmitter.emit("business-update-order-status", {
  //       businessId: businessId,
  //       orderStatus: order.status,
  //       orderTrackingID: order.trackingID,
  //     });

  //     const business = await Business.findById(businessId).lean();

  //     if (order.personnelInformation.sender.email) {
  //       void emailService.sendOrderStatusUpdate({
  //         email: order.personnelInformation.sender.email,
  //         name: order.personnelInformation.sender.name,
  //         trackingID: order.trackingID,
  //         status: order.status,
  //         businessName: business?.name,
  //         slug: business?.slug,
  //         amount: order.totalAmount
  //       });
  //     }

  //     if (order.shippingType === "international") {
  //       const senderPhone = order.personnelInformation.sender.phone;
  //       const senderCountryCode = order.personnelInformation.sender.countryCode;
  //       if (!senderPhone || !senderCountryCode) {
  //         logger.warn(
  //           `Order ${order.trackingID}: missing sender phone or country code — skipping WhatsApp status update`
  //         );
  //       } else {
  //         const formattedNumber = toWhatsAppNumber(senderCountryCode, senderPhone);

  //         if (!formattedNumber) {
  //           logger.warn(
  //             `Order ${order.trackingID}: invalid sender phone "${senderPhone}" for country "${senderCountryCode}" — skipping WhatsApp status update`
  //           );
  //         } else {
  //           void whatsappService.sendOrderStatusUpdateTemplate({
  //             to: formattedNumber,
  //             customerName: order.personnelInformation.sender.name,
  //             orderStatus: order.status,
  //             trackingId: order.trackingID,
  //             amount: order.totalAmount ?? 0,
  //             trackingLink: `https://logisticspadi.com/${business?.slug}/track-order/${order.trackingID}`,
  //           });
  //         }
  //       }
  //     }

  //     void sendOrderStatusSMS(order, status, business?.name);

  //     if ((status === "delivered" || status === "canceled") && order.riderID) {
  //       void redisClient
  //         .del(`rider-stats:${order.riderID}`)
  //         .catch((error: any) =>
  //           logger.warn(error?.message || "Redis delete failed"),
  //         );
  //     }

  //     return order;
  //   } finally {
  //     await session.endSession();
  //   }
  // }

  public async changeRider(
    businessId: string,
    orderId: string,
    newRiderId: string,
  ) {
    if (!newRiderId) {
      throw new AppError(400, "Rider ID is required");
    }

    const order = await Order.findOne(
      tenantScope({ _id: orderId }, businessId),
    );

    if (!order) {
      throw new AppError(404, "Order not found");
    }

    if (LOCKED_RIDER_CHANGE_STATUSES.includes(order.status)) {
      throw new AppError(
        400,
        "Rider cannot be changed once the order is in-transit or completed",
      );
    }

    const newRider = await Rider.findOne(
      tenantScope(
        { _id: newRiderId, isDeleted: false, status: "active" },
        businessId,
      ),
    );

    if (!newRider) {
      throw new AppError(404, "Rider not found");
    }

    if ((newRider.todaysRideCount ?? 0) >= newRider.dailyCapacity) {
      throw new AppError(400, "Rider has reached their daily capacity");
    }

    const currentRiderId = order.riderID?.toString();

    if (currentRiderId === newRiderId) {
      return order;
    }

    const session = await startSession();

    try {
      const updatedOrder = await session.withTransaction(async () => {
        if (currentRiderId) {
          await Rider.findByIdAndUpdate(
            currentRiderId,
            { $inc: { todaysRideCount: -1 } },
            { session },
          );
        }

        const updatedOrder = await Order.findByIdAndUpdate(
          orderId,
          { riderID: newRiderId },
          { new: true, session },
        );

        if (!updatedOrder) {
          throw new AppError(404, "Order not found");
        }

        await Rider.findByIdAndUpdate(
          newRiderId,
          { $inc: { todaysRideCount: 1 } },
          { session },
        );

        return updatedOrder;
      });

      void termiiService.sendRiderPickupNotification(
        newRider.phone,
        newRider.name,
        order.trackingID,
      );

      if (currentRiderId) {
        void redisClient
          .del(`rider-stats:${currentRiderId}`)
          .catch((error: any) =>
            logger.warn(error?.message || "Redis delete failed"),
          );
      }

      void redisClient
        .del(`rider-stats:${newRiderId}`)
        .catch((error: any) =>
          logger.warn(error?.message || "Redis delete failed"),
        );

      return updatedOrder;
    } finally {
      await session.endSession();
    }
  }
}
