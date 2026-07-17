import { ClientSession } from "mongoose";
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

  /**
   * Auto-assigns an order to the next eligible rider in the rotation.
   * "Next" = the eligible auto-assign rider who was assigned longest ago
   * (or never assigned). This is atomic under concurrency: the rider is
   * selected AND claimed (lastAutoAssignedAt stamped, todaysRideCount
   * incremented) in a single findOneAndUpdate, so two orders arriving
   * at once can't both grab the same rider.
   */
  public async assignAutoRider(
    businessId: string,
    order: IOrder,
    session?: ClientSession,
  ): Promise<void> {
    try {
      if (order.riderID) {
        return;
      }

      const rider = await Rider.findOneAndUpdate(
        {
          businessId,
          autoAssign: true,
          status: "active",
          isDeleted: false,
          $expr: { $lt: ["$todaysRideCount", "$dailyCapacity"] },
        },
        {
          $set: { lastAutoAssignedAt: new Date() },
          $inc: { todaysRideCount: 1 },
        },
        {
          sort: { lastAutoAssignedAt: 1 }, // null/oldest first = next in line
          new: true,
          session,
        },
      );

      if (!rider) {
        logger.warn(
          `No eligible auto-assign rider found for order ${order.trackingID} in business ${businessId}`,
        );
        return;
      }

      await Order.findByIdAndUpdate(
        order._id,
        { riderID: rider._id },
        { session },
      );

      void termiiService.sendRiderPickupNotification(
        rider.phone,
        rider.name,
        order.trackingID,
      );
    } catch (error: any) {
      logger.error(
        `Auto-assign failed for order ${order?.trackingID}: ${error?.message || "Unknown error"}`,
      );
    }
  }

  /**
   * Turns auto-assign on or off for a single rider. Any number of riders
   * per business can have autoAssign: true — they form the rotation pool.
   */
  public async toggleAutoAssign(
    businessId: string,
    riderId: string,
    enabled: boolean,
  ): Promise<void> {
    const rider = await Rider.findOneAndUpdate(
      { _id: riderId, businessId, isDeleted: false },
      { autoAssign: enabled },
      { new: true },
    );

    if (!rider) {
      throw new Error("Rider not found for this business");
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
// import { ClientSession, startSession } from "mongoose";
// import logger from "../../logger";
// // import AppError from "../../utilities/ErrorHandler";
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

//       await this.applyAssignment(rider, order, session);
//     } catch (error: any) {
//       logger.error(
//         `Rider assignment failed for order ${order?.trackingID}: ${error?.message || "Unknown error"}`,
//       );
//     }
//   }


//   public async assignAutoRider(
//     businessId: string,
//     order: IOrder,
//     session?: ClientSession,
//   ): Promise<void> {
//     try {
//       if (order.riderID) {
//         return;
//       }

//       const rider = await Rider.findOne({
//         businessId,
//         autoAssign: true,
//         status: "active",
//         isDeleted: false,
//         $expr: { $lt: ["$todaysRideCount", "$dailyCapacity"] },
//       }).session(session ?? null);

//       if (!rider) {
//         logger.warn(
//           `No eligible auto-assign rider found for order ${order.trackingID} in business ${businessId}`,
//         );
//         return;
//       }

//       await this.applyAssignment(rider, order, session);
//     } catch (error: any) {
//       logger.error(
//         `Auto-assign failed for order ${order?.trackingID}: ${error?.message || "Unknown error"}`,
//       );
//     }
//   }


//   public async setAutoAssignRider(
//     businessId: string,
//     riderId: string,
//     externalSession?: ClientSession,
//   ): Promise<void> {
//     const session = externalSession ?? (await startSession());
//     const shouldManageSession = !externalSession;

//     try {
//       const run = async (s: ClientSession) => {
//         const rider = await Rider.findOne({
//           _id: riderId,
//           businessId,
//           isDeleted: false,
//         }).session(s);

//         if (!rider) {
//           throw new Error("Rider not found for this business");
//         }

//         await Rider.updateMany(
//           { businessId, autoAssign: true, _id: { $ne: riderId } },
//           { autoAssign: false },
//           { session: s },
//         );

//         await Rider.findByIdAndUpdate(
//           riderId,
//           { autoAssign: true },
//           { session: s },
//         );
//       };

//       if (shouldManageSession) {
//         await session.withTransaction(() => run(session));
//       } else {
//         await run(session);
//       }
//     } finally {
//       if (shouldManageSession) {
//         await session.endSession();
//       }
//     }
//   }


// }

// export const riderAssignmentService = new RiderAssignmentService();


