import axios, { AxiosRequestConfig } from "axios";
import AppError from "./ErrorHandler";
import logger from "../../logger";
import { Encryption } from "./Encryption";
import { redisClient } from "../config/cache";

export class SafeHaven {
  private headers: Record<string, string>;
  private baseURL: string;
  private readonly encryption = new Encryption();
  private static readonly TOKEN_CACHE_KEY = "safehaven:access_token";

  constructor() {
    this.headers = {
      accept: "application/json",
      ClientID: process.env["SAFEHAVEN_CLIENT_ID"]!,
      "content-type": "application/json",
    };
    this.baseURL = SafeHaven.ensureTrailingSlash(
      process.env["SAFEHAVEN_BASE_URL"]!,
    );
  }

  private static ensureTrailingSlash(url: string): string {
    return url.endsWith("/") ? url : `${url}/`;
  }

  private async getAccessToken(): Promise<string> {
    try {
      const cached = await redisClient.get(SafeHaven.TOKEN_CACHE_KEY);
      if (cached) {
        return this.encryption.decrypt(cached);
      }

      return await this.updateAccessToken();
    } catch (error: any) {
      logger.error("Error getting access token:", error.message);
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
      throw new AppError(
        error.response?.status || 500,
        error.response?.data?.message || "An error occurred",
      );
    }
  }

  public async getBankList(): Promise<any> {
    const url = `${this.baseURL}transfers/banks`;
    return this.makeRequest("get", url);
  }

  public async verifyBank(payload: {
    bankCode: string;
    accountNumber: string;
  }) {
    const url = `${this.baseURL}transfers/name-enquiry`;

    const response: any = await this.makeRequest("post", url, payload);

    if (response.statusCode !== 200) {
      throw new AppError(response.statusCode, response.message);
    }
    return response.data;
  }

  public async createVirtualAccount(payload: {
    amount: number;
    reference: string;
  }): Promise<any> {
    const { amount, reference: externalReference } = payload;
    const url = `${this.baseURL}virtual-accounts`;

    const bankCode = process.env["SAFEHAVEN_SETTLEMENT_BANK_CODE"];
    const accountNumber = process.env["SAFEHAVEN_SETTLEMENT_ACCOUNT_NUMBER"];

    const virtualAccountPayload = {
      validFor: parseInt(process.env["SAFEHAVEN_VIRTUAL_ACCOUNT_VALIDITY"]!),
      settlementAccount: { bankCode, accountNumber },
      amountControl: "Fixed",
      amount,
      callbackUrl: `${process.env["SAFEHAVEN_FUNDING_WEBHOOK_URL"]}/${externalReference}`,
      externalReference,
    };

    const response: any = await this.makeRequest(
      "post",
      url,
      virtualAccountPayload,
    );

    return response.data;
  }

  public async verifyPayment(sessionID: string): Promise<any> {
    const url = `${this.baseURL}virtual-accounts/status`;
    const payload = { sessionId: sessionID };
    const response: any = await this.makeRequest("post", url, payload);

    if (response.statusCode !== 200) {
      throw new AppError(response.statusCode, response.message);
    }
    return response.data;
  }

  public async makeTransfer(payload: any): Promise<any> {
    const {
      amount,
      reference: externalReference,
      beneficiaryAccountNumber,
      beneficiaryBankCode,
      nameEnquiryReference,
    } = payload;

    const url = `${this.baseURL}transfers`;
    const transferPayload = {
      saveBeneficiary: false,
      nameEnquiryReference,
      debitAccountNumber: process.env["SAFEHAVEN_SETTLEMENT_ACCOUNT_NUMBER"],
      beneficiaryAccountNumber,
      beneficiaryBankCode,
      amount,
      paymentReference: externalReference,
      narration: "Daily SME business payment",
    };

    return this.makeRequest("post", url, transferPayload);
  }

  public async makeNameEnquiry(payload: any): Promise<string> {
    const url = `${this.baseURL}transfers/name-enquiry`;
    const response: any = await this.makeRequest("post", url, payload);
    return response.data.sessionId;
  }

  public async initiateVerification(BVN: string): Promise<any> {
    const url = `${this.baseURL}identity/v2`;
    const payload = {
      type: "BVN",
      async: false,
      number: BVN,
      debitAccountNumber: process.env["SAFEHAVEN_SETTLEMENT_ACCOUNT_NUMBER"],
    };

    return this.makeRequest("post", url, payload);
  }

  public async validateVerification(payload: {
    identityId: string;
    otp: string;
  }): Promise<any> {
    const { identityId, otp } = payload;
    const url = `${this.baseURL}identity/v2/validate`;

    return this.makeRequest("post", url, {
      identityId,
      otp,
      type: "BVN",
    });
  }

  private async updateAccessToken(): Promise<string> {
    const { access_token, expires_in } = await this.getNewAccessToken();
    const encryptedAccessToken = this.encryption.encrypt(access_token);
    await redisClient.setEx(
      SafeHaven.TOKEN_CACHE_KEY,
      expires_in - 10,
      encryptedAccessToken,
    );
    return access_token;
  }

  private async getNewAccessToken() {
    const data = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env["SAFEHAVEN_CLIENT_ID"] || "",
      client_assertion_type:
        "urn:ietf:params:oauth:client-assertion-type:jwt-bearer",
      client_assertion: process.env["SAFEHAVEN_CLIENT_ASSERTION"] || "",
    });

    const config: AxiosRequestConfig = {
      method: "post",
      maxBodyLength: Infinity,
      url: `${this.baseURL}oauth2/token`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data,
    };

    const response = await axios.request(config);

    return response.data;
  }
}
