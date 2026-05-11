import axios, { AxiosRequestConfig } from "axios";
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
}
