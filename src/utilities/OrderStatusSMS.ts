import { IOrder } from "../models/Order.Model";
import { Business } from "../models/Business.Model";
import { termiiService } from "./Termii";
import logger from "../../logger";

export async function sendOrderStatusSMS(
  order: IOrder,
  status: string,
): Promise<void> {
  const { receiver, sender } = order.personnelInformation;
  const trackingID = order.trackingID.replace("SME-", "");

  sendSenderSMS(sender.phone, sender.name, receiver.name, trackingID, status);
  sendReceiverSMS(
    receiver.phone,
    receiver.name,
    sender.name,
    trackingID,
    status,
  );

  try {
    const business = await Business.findById(order.businessId)
      .select("phone")
      .lean();
    if (business?.phone) {
      sendBusinessSMS(business.phone, trackingID, status);
    }
  } catch (error: any) {
    logger.error(
      `Failed to fetch business phone for order SMS: ${error?.message}`,
    );
  }
}

function sendSenderSMS(
  phone: string,
  senderName: string,
  receiverName: string,
  trackingID: string,
  status: string,
): void {
  switch (status) {
    case "paid":
      termiiService.sendOrderPaid(phone, senderName, trackingID);
      break;
    case "approved":
      termiiService.sendOrderApproved(phone, senderName, trackingID);
      break;
    case "processing":
      termiiService.sendOrderProcessing(phone, senderName, trackingID);
      break;
    case "in-transit":
      termiiService.sendOrderInTransit(
        phone,
        senderName,
        receiverName,
        trackingID,
      );
      break;
    case "delivered":
      termiiService.sendOrderDelivered(
        phone,
        senderName,
        receiverName,
        trackingID,
      );
      break;
    case "canceled":
      termiiService.sendOrderCanceled(phone, senderName, trackingID);
      break;
  }
}

function sendReceiverSMS(
  phone: string,
  receiverName: string,
  senderName: string,
  trackingID: string,
  status: string,
): void {
  switch (status) {
    case "in-transit":
      termiiService.sendReceiverInTransit(
        phone,
        receiverName,
        senderName,
        trackingID,
      );
      break;
    case "delivered":
      termiiService.sendReceiverDelivered(
        phone,
        receiverName,
        senderName,
        trackingID,
      );
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
    case "approved":
      termiiService.sendBusinessOrderApproved(phone, trackingID);
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
