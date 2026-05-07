import EventEmitter from "events";
import { ObjectId } from "mongoose";
import logger from "../../logger";
import { Business } from "../models/Business.Model";
import { Order } from "../models/Order.Model";
import { Rider } from "../models/Rider.Model";

class OrderStatusUpdateEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(10);
  }
}

export const orderStatusUpdateEventEmitter =
  new OrderStatusUpdateEventEmitter();

orderStatusUpdateEventEmitter.on(
  "business-update-order-status",
  async (payload: {
    buisnessId: ObjectId;
    orderStatus: string;
    orderTrackingID: string;
  }) => {
    const { buisnessId, orderStatus, orderTrackingID } = payload;

    const business = await Business.findById(buisnessId).select("name").lean();

    if (!business) {
      logger.warn(
        `Business with ID ${buisnessId} not found for order status update event`,
      );
      return;
    }
    const { name: businessName } = business;

    const orderStatusMessage = `Your order with tracking ID ${orderTrackingID} from ${businessName} is now ${orderStatus}.`;

    await Order.findOneAndUpdate(
      { trackingID: orderTrackingID },
      {
        $push: {
          history: {
            status: orderStatusMessage,
            timestamp: new Date(),
          },
        },
      },
    );

    logger.info(
      `Emitted business-update-order-status event for order ${orderTrackingID} with status ${orderStatus}`,
    );
  },
);

orderStatusUpdateEventEmitter.on(
  "rider-update-order-status",
  async (payload: {
    riderId: ObjectId;
    orderStatus: string;
    orderTrackingID: string;
  }) => {
    const { riderId, orderStatus, orderTrackingID } = payload;

    const rider = await Rider.findById(riderId).select("name").lean();

    if (!rider) {
      logger.warn(
        `Rider with ID ${riderId} not found for order status update event`,
      );
      return;
    }
    const { name: riderName } = rider;

    const orderStatusMessage = `Rider ${riderName} updated your order with tracking ID ${orderTrackingID} to ${orderStatus}.`;

    await Order.findOneAndUpdate(
      { trackingID: orderTrackingID },
      {
        $push: {
          history: {
            status: orderStatusMessage,
            timestamp: new Date(),
          },
        },
      },
    );

    logger.info(
      `Emitted rider-update-order-status event for order ${orderTrackingID} with status ${orderStatus}`,
    );
  },
);
