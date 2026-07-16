import { ClientSession, startSession } from "mongoose";
import logger from "../../logger";
// import AppError from "../../utilities/ErrorHandler";
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

      await this.applyAssignment(rider, order, session);
    } catch (error: any) {
      logger.error(
        `Rider assignment failed for order ${order?.trackingID}: ${error?.message || "Unknown error"}`,
      );
    }
  }


  public async assignAutoRider(
    businessId: string,
    order: IOrder,
    session?: ClientSession,
  ): Promise<void> {
    try {
      if (order.riderID) {
        return;
      }

      const rider = await Rider.findOne({
        businessId,
        autoAssign: true,
        status: "active",
        isDeleted: false,
        $expr: { $lt: ["$todaysRideCount", "$dailyCapacity"] },
      }).session(session ?? null);

      if (!rider) {
        logger.warn(
          `No eligible auto-assign rider found for order ${order.trackingID} in business ${businessId}`,
        );
        return;
      }

      await this.applyAssignment(rider, order, session);
    } catch (error: any) {
      logger.error(
        `Auto-assign failed for order ${order?.trackingID}: ${error?.message || "Unknown error"}`,
      );
    }
  }


  public async setAutoAssignRider(
    businessId: string,
    riderId: string,
    externalSession?: ClientSession,
  ): Promise<void> {
    const session = externalSession ?? (await startSession());
    const shouldManageSession = !externalSession;

    try {
      const run = async (s: ClientSession) => {
        const rider = await Rider.findOne({
          _id: riderId,
          businessId,
          isDeleted: false,
        }).session(s);

        if (!rider) {
          throw new Error("Rider not found for this business");
        }

        await Rider.updateMany(
          { businessId, autoAssign: true, _id: { $ne: riderId } },
          { autoAssign: false },
          { session: s },
        );

        await Rider.findByIdAndUpdate(
          riderId,
          { autoAssign: true },
          { session: s },
        );
      };

      if (shouldManageSession) {
        await session.withTransaction(() => run(session));
      } else {
        await run(session);
      }
    } finally {
      if (shouldManageSession) {
        await session.endSession();
      }
    }
  }

  private async applyAssignment(
    rider: any,
    order: IOrder,
    session?: ClientSession,
  ): Promise<void> {
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
      rider.name,
      order.trackingID,
    );
  }
}

export const riderAssignmentService = new RiderAssignmentService();

// import { ClientSession } from "mongoose";
// import logger from "../../logger";
// import { IOrder, Order } from "../models/Order.Model";
// import { Rider } from "../models/Rider.Model";
// import { termiiService } from "../utilities/Termii";

// export class RiderAssignmentService {
//   public async assignRider(
//     businessId: string,
//     order: IOrder,
//     session?: ClientSession,
//   ): Promise<void> {
//     try {
//       if (order.riderID) {
//         return;
//       }

//       const riderQuery: any = {
//         businessId,
//         status: "active",
//         isDeleted: false,
//         $expr: { $lt: ["$todaysRideCount", "$dailyCapacity"] },
//       };
//       if (order.rideType) {
//         riderQuery.rideType = order.rideType;
//       }

//       const rider = await Rider.findOne(riderQuery)
//         .sort({ todaysRideCount: 1 })
//         .session(session ?? null);

//       if (!rider) {
//         logger.warn(
//           `No available rider found for order ${order.trackingID} in business ${businessId} (rideType: ${order.rideType ?? "any"})`,
//         );
//         return;
//       }

//       const orderUpdate = Order.findByIdAndUpdate(
//         order._id,
//         { riderID: rider._id },
//         { session },
//       );

//       const riderUpdate = Rider.findByIdAndUpdate(
//         rider._id,
//         { $inc: { todaysRideCount: 1 } },
//         { session },
//       );

//       await Promise.all([orderUpdate, riderUpdate]);

//       void termiiService.sendRiderPickupNotification(
//         rider.phone,
//         rider.name,
//         order.trackingID,
//       );
//     } catch (error: any) {
//       logger.error(
//         `Rider assignment failed for order ${order?.trackingID}: ${error?.message || "Unknown error"}`,
//       );
//     }
//   }
// }

// export const riderAssignmentService = new RiderAssignmentService();
