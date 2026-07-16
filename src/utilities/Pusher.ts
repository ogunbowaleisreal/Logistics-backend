import Pusher from "pusher";
import logger from "../../logger";

export class PusherService {
  private client = new Pusher({
    appId: process.env["PUSHER_APP_ID"]!,
    key: process.env["PUSHER_KEY"]!,
    secret: process.env["PUSHER_SECRET"]!,
    cluster: process.env["PUSHER_CLUSTER"]!,
    useTLS: true,
  });

  async notifyOrderStatus(
    orderID: string,
    payload: { status: string; trackingID?: string; totalAmount?: number },
  ) {
    try {
      await this.client.trigger(`order-${orderID}`, "status-updated", payload);
    } catch (error) {
      logger.error("Failed to push order status update via Pusher", error);
    }
  }
}
