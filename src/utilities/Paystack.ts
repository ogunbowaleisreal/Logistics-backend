import axios from "axios";
import crypto from "crypto";
import AppError from "./ErrorHandler";

export class PaystackServices {
  public async initializePayment(payload: { email: string; amount: number }) {
    const { email, amount } = payload;
    const roundedAmount = parseFloat((amount * 100).toFixed());

    let paystackCallbackURI;
    if (process.env.NODE_ENV === "development") {
      paystackCallbackURI = process.env["PAYSTACK_DEV_CALLBACK_URL"];
    } else {
      paystackCallbackURI = process.env["PAYSTACK_LIVE_CALLBACK_URL"];
    }

    const response = axios
      .post(
        "https://api.paystack.co/transaction/initialize",
        {
          amount: roundedAmount,
          email: email,
          billName: "SME Logistics Point Purchase",
          currency: "NGN",
          callback_url: paystackCallbackURI,
        },
        {
          headers: {
            authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            "content-type": "application/json",
            "cache-control": "no-cache",
          },
        }
      )
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        throw new AppError(500, error.message);
      });
    return response;
  }

  public async verifyPayment(reference: string) {
    const response = axios
      .get(`https://api.paystack.co/transaction/verify/${reference}`, {
        headers: {
          authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "content-type": "application/json",
          "cache-control": "no-cache",
        },
      })
      .then((response) => {
        return response.data;
      })
      .catch((error) => {
        console.log(error);
        throw new AppError(500, error.message);
      });
    return response;
  }

  public async verifyWebhookOrigin(body: string, signature: string) {
    const apiKey = process.env["PAYSTACK_SECRET_KEY"]!;
    const hashType = process.env["PAYSTACK_HASH_TYPE"]!;
    const hmac = crypto.createHmac(hashType, apiKey);
    const expectedSignature = hmac.update(JSON.stringify(body)).digest("hex");
    return expectedSignature === signature;
  }
}
