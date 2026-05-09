import { IOrder } from "../models/Order.Model";
import { Business } from "../models/Business.Model";
import { termiiService } from "./Termii";
import logger from "../../logger";

export async function sendOrderStatusSMS(
  order: IOrder,
  status: string,
): Promise<void> {
  const { receiver, sender } = order.personnelInformation;
  const { trackingID } = order;

  sendReceiverSMS(receiver.phone, trackingID, status);
  sendBusinessSMS(sender.phone, trackingID, status);

  try {
    const business = await Business.findById(order.businessId)
      .select("phone")
      .lean();
    if (business?.phone && business.phone !== sender.phone) {
      sendBusinessSMS(business.phone, trackingID, status);
    }
  } catch (error: any) {
    logger.error(
      `Failed to fetch business phone for order SMS: ${error?.message}`,
    );
  }
}

function sendReceiverSMS(
  phone: string,
  trackingID: string,
  status: string,
): void {
  switch (status) {
    case "pending":
      termiiService.sendOrderPending(phone, trackingID);
      break;
    case "paid":
      termiiService.sendOrderPaid(phone, trackingID);
      break;
    case "processing":
      termiiService.sendOrderProcessing(phone, trackingID);
      break;
    case "in-transit":
      termiiService.sendOrderInTransit(phone, trackingID);
      break;
    case "delivered":
      termiiService.sendOrderDelivered(phone, trackingID);
      break;
    case "canceled":
      termiiService.sendOrderCanceled(phone, trackingID);
      break;
    case "failed":
      termiiService.sendOrderFailed(phone, trackingID);
      break;
  }
}

function sendBusinessSMS(
  phone: string,
  trackingID: string,
  status: string,
): void {
  switch (status) {
    case "pending":
      termiiService.sendBusinessOrderPending(phone, trackingID);
      break;
    case "paid":
      termiiService.sendBusinessOrderPaid(phone, trackingID);
      break;
    case "processing":
      termiiService.sendBusinessOrderProcessing(phone, trackingID);
      break;
    case "in-transit":
      termiiService.sendBusinessOrderInTransit(phone, trackingID);
      break;
    case "delivered":
      termiiService.sendBusinessOrderDelivered(phone, trackingID);
      break;
    case "canceled":
      termiiService.sendBusinessOrderCanceled(phone, trackingID);
      break;
    case "failed":
      termiiService.sendBusinessOrderFailed(phone, trackingID);
      break;
  }
}
