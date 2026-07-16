import { IOrder } from "../models/Order.Model";
import { Business } from "../models/Business.Model";
import { termiiService } from "./Termii";
import logger from "../../logger";

export async function sendOrderStatusSMS(
  order: IOrder,
  status: string,
  businessName?: string
): Promise<void> {
  const { receiver, sender } = order.personnelInformation;
  const trackingID = order.trackingID.replace("SME-", "");

  sendSenderSMS(sender.phone, sender.name, receiver.name, trackingID, status, businessName);
  sendReceiverSMS(
    receiver.phone,
    receiver.name,
    sender.name,
    trackingID,
    status,
    businessName
  );

  try {
    const business = await Business.findById(order.businessId)
      .select("phone")
      .lean();
    if (business?.phone) {
      sendBusinessSMS(business.phone, trackingID, status, businessName);
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
  businessName?: string
): void {
  switch (status) {
    case "paid":
      termiiService.sendOrderPaid(phone, senderName, trackingID, businessName);
      break;
    case "approved":
      termiiService.sendOrderApproved(phone, senderName, trackingID, businessName);
      break;
    case "processing":
      termiiService.sendOrderProcessing(phone, senderName, trackingID, businessName);
      break;
    case "in-transit":
      termiiService.sendOrderInTransit(
        phone,
        senderName,
        receiverName,
        trackingID,
        businessName
      );
      break;
    case "delivered":
      termiiService.sendOrderDelivered(
        phone,
        senderName,
        receiverName,
        trackingID,
        businessName
      );
      break;
    case "canceled":
      termiiService.sendOrderCanceled(phone, senderName, trackingID, businessName);
      break;
  }
}

function sendReceiverSMS(
  phone: string,
  receiverName: string,
  senderName: string,
  trackingID: string,
  status: string,
  businessName?: string
): void {
  switch (status) {
    case "in-transit":
      termiiService.sendReceiverInTransit(
        phone,
        receiverName,
        senderName,
        trackingID,
        businessName
      );
      break;
    case "delivered":
      termiiService.sendReceiverDelivered(
        phone,
        receiverName,
        senderName,
        trackingID,
        businessName
      );
      break;
  }
}

function sendBusinessSMS(
  phone: string,
  trackingID: string,
  status: string,
  businessName?: string
): void {
  switch (status) {
    case "pending":
      termiiService.sendBusinessOrderPending(phone, trackingID, businessName);
      break;
    case "paid":
      termiiService.sendBusinessOrderPaid(phone, trackingID, businessName);
      break;
    case "approved":
      termiiService.sendBusinessOrderApproved(phone, trackingID, businessName);
      break;
    case "processing":
      termiiService.sendBusinessOrderProcessing(phone, trackingID, businessName);
      break;
    case "in-transit":
      termiiService.sendBusinessOrderInTransit(phone, trackingID, businessName);
      break;
    case "delivered":
      termiiService.sendBusinessOrderDelivered(phone, trackingID, businessName);
      break;
    case "canceled":
      termiiService.sendBusinessOrderCanceled(phone, trackingID, businessName);
      break;
    case "failed":
      termiiService.sendBusinessOrderFailed(phone, trackingID, businessName);
      break;
  }
}
