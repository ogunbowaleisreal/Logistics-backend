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

  public sendOrderDelivered(to: string, orderNumber: string): void {
    void this.send(
      to,
      `Yay! Your SME order #${orderNumber} has been delivered. We hope you love your products! Let us know how it goes`,
    );
  }

  public sendOrderInTransit(to: string, orderNumber: string): void {
    void this.send(
      to,
      `Good news! Your SME order #${orderNumber} is in transit and on its way to you. Get ready to glow — it's almost there! `,
    );
  }

  public sendOrderShipped(to: string, orderNumber: string): void {
    void this.send(
      to,
      `Your SME order #${orderNumber} has shipped! It's officially on its way — we'll let you know once it's closer to your doorstep.`,
    );
  }

  public sendOrderDeclined(to: string, orderNumber: string): void {
    void this.send(
      to,
      `Unfortunately, order #${orderNumber} couldn't be completed. Kindly check your payment method or reach out — we're happy to assist!`,
    );
  }

  public sendOrderConfirmed(to: string, orderNumber: string): void {
    void this.send(
      to,
      `SME order #${orderNumber} has been confirmed! Everything's on track and we'll keep you posted as we move to shipping`,
    );
  }

  public sendOrderProcessing(to: string, orderNumber: string): void {
    void this.send(
      to,
      `Just a heads-up — your SME order #${orderNumber} is now being processed. We're prepping your skincare goodies with love!`,
    );
  }

  public sendRiderPickupNotification(to: string, trackingID: string): void {
    void this.send(
      to,
      `You have a new pickup assigned. Order #${trackingID}. Please check your dashboard for details.`,
    );
  }

  public sendRiderOTP(to: string, otp: string): void {
    void this.send(
      to,
      `Your SME Logistics login OTP is: ${otp}. It expires in 5 minutes. Do not share this code.`,
    );
  }
}

export const termiiService = new TermiiService();
