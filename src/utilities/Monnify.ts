import axios, { AxiosRequestConfig } from "axios";
import crypto from "crypto";
import logger from "../../logger";
import AppError from "./ErrorHandler";
import { Buffer } from "buffer";
import { Encryption } from "./Encryption";
import { redisClient } from "../config/cache";

export class Monnify {
  private headers: Record<string, string>;
  private baseURL: string;
  private readonly encryption = new Encryption();
  private static readonly TOKEN_CACHE_KEY = "monnify:access_token";

  constructor() {
    this.headers = {
      accept: "application/json",
      "content-type": "application/json",
    };
    this.baseURL = Monnify.ensureTrailingSlash(
      process.env["MONNIFY_BASE_URL"]!,
    );
  }

  private static ensureTrailingSlash(url: string): string {
    return url.endsWith("/") ? url : `${url}/`;
  }

  private async getAccessToken(): Promise<string> {
    try {
      const cached = await redisClient.get(Monnify.TOKEN_CACHE_KEY);
      if (cached) {
        return this.encryption.decrypt(cached);
      }

      return await this.updateAccessToken();
    } catch (error: any) {
      logger.error("Error updating access token:", error.message);
      throw new Error(error.message);
    }
  }

  private async setAuthorizationHeader() {
    this.headers.authorization = `Bearer ${await this.getAccessToken()}`;
  }

  private async makeRequest<T>(
    method: "get" | "post",
    url: string,
    data?: any,
  ): Promise<T> {
    await this.setAuthorizationHeader();
    const config: AxiosRequestConfig = {
      method,
      url,
      headers: this.headers,
      data,
    };

    try {
      const response = await axios(config);
      return response.data;
    } catch (error: any) {
      console.log(error.response);
      logger.error(
        "Monnify API request error:",
        error.response?.data?.responseMessage,
      );
      throw new AppError(
        error.response?.status || 500,
        error.response?.data?.responseMessage || "An error occurred",
      );
    }
  }

  public async updateAccessToken() {
    const { responseBody } = await this.getNewAccessToken();

    const { accessToken, expiresIn } = responseBody;

    const encryptedAccessToken = this.encryption.encrypt(accessToken);

    await redisClient.setEx(
      Monnify.TOKEN_CACHE_KEY,
      expiresIn - 10,
      encryptedAccessToken,
    );

    return accessToken;
  }

  public async getNewAccessToken() {
    const key = `${process.env["MONNIFY_API_KEY"]}:${process.env["MONNIFY_SECRET_KEY"]}`;

    const credentials = Buffer.from(
      `${process.env["MONNIFY_API_KEY"]}:${process.env["MONNIFY_SECRET_KEY"]}`,
    ).toString("base64");

    const config: AxiosRequestConfig = {
      method: "post",
      url: `${this.baseURL}api/v1/auth/login`,
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    };

    const response = await axios.request(config);
    return response.data;
  }

  public async initiatePayment(data: {
    email: string;
    amount: number;
    reference: string;
    customerName: string;
    redirectUrl?: string;
  }): Promise<{ checkoutUrl: string; transactionReference: string }> {
    try {
      const response: any = await this.makeRequest(
        "post",
        `${this.baseURL}api/v1/merchant/transactions/init-transaction`,
        {
          amount: data.amount,
          customerName: data.customerName,
          customerEmail: data.email,
          paymentReference: data.reference,
          paymentDescription: "Order payment",
          currencyCode: "NGN",
          contractCode: process.env.MONNIFY_CONTRACT_CODE,
          redirectUrl:
            data.redirectUrl ||
            `${process.env.BASE_URL}/api/client/order/monnify/webhook`,
          paymentMethods: ["CARD", "ACCOUNT_TRANSFER"],
        },
      );

      if (!response.requestSuccessful) {
        throw new AppError(
          400,
          response.responseMessage || "Payment initiation failed",
        );
      }


      logger.info(`Monnify: Initiated payment: ${data.reference}`);
      return {
        checkoutUrl: response.responseBody.checkoutUrl,
        transactionReference: response.responseBody.transactionReference,
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Monnify: Error initiating payment:", error);
      throw new AppError(
        400,
        error.response?.data?.responseMessage || "Payment initiation failed",
      );
    }
  }

  public async verifyPayment(transactionReference: string): Promise<any> {
    try {
      const response = await this.makeRequest<any>(
        "get",
        `${this.baseURL}api/v2/transactions/${encodeURIComponent(transactionReference)}`,
      );

      if (!response.requestSuccessful) {
        throw new AppError(400, "Payment verification failed");
      }

      logger.info(`Monnify: Verified payment: ${transactionReference}`);
      return response.responseBody;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Monnify: Error verifying payment:", error);
      throw new AppError(
        400,
        error.response?.data?.responseMessage || "Payment verification failed",
      );
    }
  }

  public async verifyNIN(NIN: string) {
    const response = await this.makeRequest<any>(
      "post",
      `${this.baseURL}api/v1/vas/nin-details`,
      { nin: NIN },
    );
    if (response.requestSuccessful === false) {
      logger.error("NIN verification failed:", response.responseMessage);
      throw Error("NIN verification failed");
    }

    return response;
  }

  public async verifyBVN(payload: {
    bvn: string;
    name: string;
    dateOfBirth: string;
    mobileNo: string;
  }) {
    const response = await this.makeRequest<any>(
      "post",
      `${this.baseURL}api/v1/vas/bvn-details-match`,
      payload,
    );
    if (response.requestSuccessful === false) {
      logger.error("BVN verification failed:", response.responseMessage);
      throw Error("BVN verification failed");
    }
    return response;
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hmac = crypto.createHmac("sha512", process.env.MONNIFY_SECRET_KEY!);
    const expected = hmac.update(payload).digest("hex");
    return expected === signature;
  }
}
