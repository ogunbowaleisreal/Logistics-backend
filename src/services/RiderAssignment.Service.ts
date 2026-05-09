import { ClientSession } from "mongoose";
import logger from "../../logger";
import { IOrder, Order } from "../models/Order.Model";
import { Rider } from "../models/Rider.Model";
import { termiiService } from "../utilities/Termii";

export class RiderAssignmentService {
  public async assignRider(
    businessId: string,
    order: IOrder,
    session?: ClientSession,
  ): Promise<void> {
    try {
      if (order.riderID) {
        return;
      }

      const riderQuery: any = {
        businessId,
        status: "active",
        isDeleted: false,
        $expr: { $lt: ["$todaysRideCount", "$dailyCapacity"] },
      };
      if (order.rideType) {
        riderQuery.rideType = order.rideType;
      }

      const rider = await Rider.findOne(riderQuery)
        .sort({ todaysRideCount: 1 })
        .session(session ?? null);

      if (!rider) {
        logger.warn(
          `No available rider found for order ${order.trackingID} in business ${businessId} (rideType: ${order.rideType ?? "any"})`,
        );
        return;
      }

      const orderUpdate = Order.findByIdAndUpdate(
        order._id,
        { riderID: rider._id },
        { session },
      );

      const riderUpdate = Rider.findByIdAndUpdate(
        rider._id,
        { $inc: { todaysRideCount: 1 } },
        { session },
      );

      await Promise.all([orderUpdate, riderUpdate]);

      void termiiService.sendRiderPickupNotification(
        rider.phone,
        order.trackingID,
      );
    } catch (error: any) {
      logger.error(
        `Rider assignment failed for order ${order?.trackingID}: ${error?.message || "Unknown error"}`,
      );
    }
  }
}

export const riderAssignmentService = new RiderAssignmentService();
