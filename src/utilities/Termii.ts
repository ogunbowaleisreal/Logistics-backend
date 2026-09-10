import axios from "axios";
import logger from "../../logger";

const TERMII_SMS_URL = "https://api.ng.termii.com/api/sms/send";
const BRAND_NAME = "LogisticsPadi";

class TermiiService {


  // change this method's signature and catch block:
  private async send(to: string, message: string): Promise<boolean> {
    const apiKey = process.env.TERMII_API_KEY;

    if (!apiKey) {
      logger.error("TERMII_API_KEY is not configured; skipping SMS send");
      return false;
    }

    try {
      await axios.post(
        TERMII_SMS_URL,
        {
          to: this.toInternationalFormat(to),
          from: "N-Alert",
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
      return true;
    } catch (error: any) {
      console.log(error)
      logger.error(
        `Termii SMS send failed for ${to}: ${error?.message || "Unknown error"}`,
      );
      return false;
    }
  }

  // add this new public method anywhere in the class:
  public async sendBulk(
    recipients: string[],
    message: string,
    options?: { concurrency?: number; delayMs?: number }
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    const concurrency = options?.concurrency ?? 10;
    const delayMs = options?.delayMs ?? 400;
    const errors: string[] = [];
    let success = 0;

    for (let i = 0; i < recipients.length; i += concurrency) {
      const batch = recipients.slice(i, i + concurrency);

      const results = await Promise.allSettled(
        batch.map((to) => this.send(to, message))
      );

      results.forEach((result, idx) => {
        if (result.status === "fulfilled" && result.value) {
          success++;
        } else {
          errors.push(batch[idx]);
        }
      });

      // brief pause between batches so we don't hammer Termii's rate limit
      if (i + concurrency < recipients.length) {
        await new Promise((res) => setTimeout(res, delayMs));
      }
    }

    logger.info(
      `Termii bulk SMS complete: ${success} sent, ${errors.length} failed`
    );

    return { success, failed: errors.length, errors };
  }

  private toInternationalFormat(phone: string, countryCode = "234"): string {
    // strip spaces, dashes, plus signs
    let cleaned = phone.replace(/[\s\-+]/g, "");

    // already in international format (starts with country code)
    if (cleaned.startsWith(countryCode)) {
      return cleaned;
    }

    // strip leading 0 (local format) then prepend country code
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.slice(1);
    }

    return `${countryCode}${cleaned}`;
  }


  public sendOrderPaid(
    to: string,
    senderName: string,
    orderID: string,
    businessName?: string,
  ): void {
    void this.send(
      to,
      `Hi ${senderName}, payment for Order #${orderID} was confirmed. Your delivery request is queued for approval. Thank you.\n\nRegards,\n${businessName ?? BRAND_NAME}`,
    );
  }

  public sendOrderApproved(
    to: string,
    senderName: string,
    orderID: string,
    businessName?: string,
  ): void {
    void this.send(
      to,
      `Hi ${senderName}, your for Order #${orderID} has been approved. Your delivery request is queued for processing. Thank you.\n\nRegards,\n${businessName ?? BRAND_NAME}`,
    );
  }

  public sendOrderProcessing(
    to: string,
    senderName: string,
    orderID: string,
    businessName?: string,
  ): void {
    void this.send(
      to,
      `Hi ${senderName}, your rider is on the way for pickup on Order #${orderID}. Please stay available for smooth collection.\n\nRegards,\n${businessName ?? BRAND_NAME}`,
    );
  }

  public sendOrderInTransit(
    to: string,
    senderName: string,
    receiverName: string,
    orderID: string,
    businessName?: string,
  ): void {
    void this.send(
      to,
      `Hi ${senderName}, Order #${orderID} has been picked up and is currently on the way to the ${receiverName}. We'll keep you updated.\n\nRegards,\n${businessName ?? BRAND_NAME}`,
    );
  }

  public sendOrderDelivered(
    to: string,
    senderName: string,
    receiverName: string,
    orderID: string,
    businessName?: string,
  ): void {
    void this.send(
      to,
      `Hi ${senderName}, Order #${orderID} was successfully delivered to the ${receiverName}. Thank you for choosing our service.\n\nRegards,\n${businessName ?? BRAND_NAME}`,
    );
  }

  public sendOrderCanceled(
    to: string,
    senderName: string,
    orderID: string,
    businessName?: string,
  ): void {
    void this.send(
      to,
      `Hi ${senderName}, Order #${orderID} could not be processed at this time. Please contact support for assistance.\n\nRegards,\n${businessName ?? BRAND_NAME}`,
    );
  }

  public sendReceiverInTransit(
    to: string,
    receiverName: string,
    senderName: string,
    orderID: string,
    businessName?: string,
  ): void {
    void this.send(
      to,
      `Hi ${receiverName}, ${senderName} sent you a package. Order #${orderID} is on the way. Please stay available to receive your delivery.\n\nRegards,\n${businessName ?? BRAND_NAME}`,
    );
  }

  public sendReceiverDelivered(
    to: string,
    receiverName: string,
    senderName: string,
    orderID: string,
    businessName?: string,
  ): void {
    void this.send(
      to,
      `Hi ${receiverName}, your package from ${senderName} with Order #${orderID} was successfully delivered. Thank you.\n\nRegards,\n${businessName ?? BRAND_NAME}`,
    );
  }

  public sendBusinessOrderPending(
    to: string,
    orderNumber: string,
    businessName?: string,
  ): void {
    void this.send(
      to,
      `New order #${orderNumber} received. It is awaiting confirmation on your SME dashboard.\n\nRegards,\n${businessName ?? BRAND_NAME}`,
    );
  }

  public sendBusinessOrderPaid(
    to: string,
    orderNumber: string,
    businessName?: string,
  ): void {
    void this.send(
      to,
      `Order #${orderNumber} payment confirmed. Please proceed to approve this order.\n\nRegards,\n${businessName ?? BRAND_NAME}`,
    );
  }

  public sendBusinessOrderApproved(
    to: string,
    orderNumber: string,
    businessName?: string,
  ): void {
    void this.send(
      to,
      `Order #${orderNumber} has been approved. Please proceed to process this order.\n\nRegards,\n${businessName ?? BRAND_NAME}`,
    );
  }

  public sendBusinessOrderProcessing(
    to: string,
    orderNumber: string,
    businessName?: string,
  ): void {
    void this.send(
      to,
      `Order #${orderNumber} is now being processed.\n\nRegards,\n${businessName ?? BRAND_NAME}`,
    );
  }

  public sendBusinessOrderInTransit(
    to: string,
    orderNumber: string,
    businessName?: string,
  ): void {
    void this.send(
      to,
      `Order #${orderNumber} is in transit to the receiver.\n\nRegards,\n${businessName ?? BRAND_NAME}`,
    );
  }

  public sendBusinessOrderDelivered(
    to: string,
    orderNumber: string,
    businessName?: string,
  ): void {
    void this.send(
      to,
      `Order #${orderNumber} has been successfully delivered.\n\nRegards,\n${businessName ?? BRAND_NAME}`,
    );
  }

  public sendBusinessOrderCanceled(
    to: string,
    orderNumber: string,
    businessName?: string,
  ): void {
    void this.send(
      to,
      `Order #${orderNumber} has been canceled.\n\nRegards,\n${businessName ?? BRAND_NAME}`,
    );
  }

  public sendBusinessOrderFailed(
    to: string,
    orderNumber: string,
    businessName?: string,
  ): void {
    void this.send(
      to,
      `Order #${orderNumber} could not be completed due to a payment failure.\n\nRegards,\n${businessName ?? BRAND_NAME}`,
    );
  }

  public sendRiderPickupNotification(
    to: string,
    riderName: string,
    orderID: string,
    businessName?: string,
  ): void {
    void this.send(
      to,
      `Hi ${riderName}, Order #${orderID} has been assigned to you for delivery. Please proceed to pickup location and begin fulfillment.\n\nRegards,\n${businessName ?? BRAND_NAME}`,
    );
  }

  public sendRiderOTP(to: string, otp: string, businessName?: string): void {
    void this.send(
      to,
      `Your LogisticsPadi login OTP is: ${otp}. It expires in 5 minutes. Do not share this code.\n\nRegards,\n${businessName ?? BRAND_NAME}`,
    );
  }

  public sendWithdrawalSuccess(
    to: string,
    name: string,
    amount: number,
    reference: string,
    businessName?: string,
  ): void {
    void this.send(
      to,
      `Hi ${name}, your withdrawal of ₦${amount.toLocaleString()} (Ref: ${reference}) was successful. Funds will reflect in your bank account shortly.\n\nRegards,\n${businessName ?? BRAND_NAME}`,
    );
  }
}

export const termiiService = new TermiiService();

