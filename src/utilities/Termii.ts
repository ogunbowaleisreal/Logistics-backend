import axios from "axios";
import logger from "../../logger";

const TERMII_SMS_URL = "https://api.ng.termii.com/api/sms/send";

class TermiiService {
  private async send(to: string, message: string): Promise<void> {
    const apiKey = process.env.TERMII_API_KEY;

    if (!apiKey) {
      logger.error("TERMII_API_KEY is not configured; skipping SMS send");
      return;
    }

    try {
      await axios.post(
        TERMII_SMS_URL,
        {
          to,
          from: "BillPadi",
          sms: message,
          type: "plain",
          api_key: apiKey,
          channel: "generic",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    } catch (error: any) {
      logger.error(
        `Termii SMS send failed for ${to}: ${error?.message || "Unknown error"}`,
      );
    }
  }

  public sendOrderPaid(to: string, senderName: string, orderID: string): void {
    void this.send(
      to,
      `Hi ${senderName}, payment for Order #${orderID} was confirmed. Your delivery request is queued for approval. Thank you.`,
    );
  }

  public sendOrderApproved(
    to: string,
    senderName: string,
    orderID: string,
  ): void {
    void this.send(
      to,
      `Hi ${senderName}, your for Order #${orderID} has been approved. Your delivery request is queued for processing. Thank you.`,
    );
  }

  public sendOrderProcessing(
    to: string,
    senderName: string,
    orderID: string,
  ): void {
    void this.send(
      to,
      `Hi ${senderName}, your rider is on the way for pickup on Order #${orderID}. Please stay available for smooth collection.`,
    );
  }

  public sendOrderInTransit(
    to: string,
    senderName: string,
    receiverName: string,
    orderID: string,
  ): void {
    void this.send(
      to,
      `Hi ${senderName}, Order #${orderID} has been picked up and is currently on the way to the ${receiverName}. We'll keep you updated.`,
    );
  }

  public sendOrderDelivered(
    to: string,
    senderName: string,
    receiverName: string,
    orderID: string,
  ): void {
    void this.send(
      to,
      `Hi ${senderName}, Order #${orderID} was successfully delivered to the ${receiverName}. Thank you for choosing our service.`,
    );
  }

  public sendOrderCanceled(
    to: string,
    senderName: string,
    orderID: string,
  ): void {
    void this.send(
      to,
      `Hi ${senderName}, Order #${orderID} could not be processed at this time. Please contact support for assistance.`,
    );
  }

  public sendReceiverInTransit(
    to: string,
    receiverName: string,
    senderName: string,
    orderID: string,
  ): void {
    void this.send(
      to,
      `Hi ${receiverName}, ${senderName} sent you a package. Order #${orderID} is on the way. Please stay available to receive your delivery.`,
    );
  }

  public sendReceiverDelivered(
    to: string,
    receiverName: string,
    senderName: string,
    orderID: string,
  ): void {
    void this.send(
      to,
      `Hi ${receiverName}, your package from ${senderName} with Order #${orderID} was successfully delivered. Thank you.`,
    );
  }

  public sendBusinessOrderPending(to: string, orderNumber: string): void {
    void this.send(
      to,
      `New order #${orderNumber} received. It is awaiting confirmation on your SME dashboard.`,
    );
  }

  public sendBusinessOrderPaid(to: string, orderNumber: string): void {
    void this.send(
      to,
      `Order #${orderNumber} payment confirmed. Please proceed to approve this order.`,
    );
  }

  public sendBusinessOrderApproved(to: string, orderNumber: string): void {
    void this.send(
      to,
      `Order #${orderNumber} has been approved. Please proceed to process this order.`,
    );
  }

  public sendBusinessOrderProcessing(to: string, orderNumber: string): void {
    void this.send(to, `Order #${orderNumber} is now being processed.`);
  }

  public sendBusinessOrderInTransit(to: string, orderNumber: string): void {
    void this.send(to, `Order #${orderNumber} is in transit to the receiver.`);
  }

  public sendBusinessOrderDelivered(to: string, orderNumber: string): void {
    void this.send(
      to,
      `Order #${orderNumber} has been successfully delivered.`,
    );
  }

  public sendBusinessOrderCanceled(to: string, orderNumber: string): void {
    void this.send(to, `Order #${orderNumber} has been canceled.`);
  }

  public sendBusinessOrderFailed(to: string, orderNumber: string): void {
    void this.send(
      to,
      `Order #${orderNumber} could not be completed due to a payment failure.`,
    );
  }

  public sendRiderPickupNotification(
    to: string,
    riderName: string,
    orderID: string,
  ): void {
    void this.send(
      to,
      `Hi ${riderName}, Order #${orderID} has been assigned to you for delivery. Please proceed to pickup location and begin fulfillment.`,
    );
  }

  public sendRiderOTP(to: string, otp: string): void {
    void this.send(
      to,
      `Your LogisticsPadi login OTP is: ${otp}. It expires in 5 minutes. Do not share this code.`,
    );
  }
}

export const termiiService = new TermiiService();
