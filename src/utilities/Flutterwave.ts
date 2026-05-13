import axios, { AxiosInstance } from "axios";
import AppError from "./ErrorHandler";
import logger from "../../logger";

export interface FlutterwaveAccountData {
  account_number: string;
  account_reference: string;
  account_name: string;
  bank_name: string;
  bank_code: string;
  email: string;
  bvn: string;
  amount?: number;
  split_code?: string;
  tx_ref: string;
  frequency: string;
  duration?: string;
  is_permanent: boolean;
  created_at: string;
  expiry_date?: string;
}

export interface FlutterwaveCreateAccountRes {
  status: string;
  message: string;
  data: FlutterwaveAccountData;
}

export interface FlutterwaveBankData {
  id: number;
  code: string;
  name: string;
}

export interface FlutterwaveTransferData {
  id: number;
  account_number: string;
  bank_code: string;
  full_name: string;
  created_at: string;
  currency: string;
  debit_currency?: string;
  amount: number;
  fee: number;
  status: string;
  reference: string;
  meta?: any;
  narration: string;
  complete_message: string;
  requires_approval: number;
  is_approved: number;
  bank_name: string;
}

export interface FlutterwaveBalanceData {
  currency: string;
  available_balance: number;
  ledger_balance: number;
}

export interface FlutterwavePaymentInitResponse {
  paymentUrl: string;
  reference: string;
  expiresAt: string;
}

export class Flutterwave {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL:
        process.env.FLUTTERWAVE_BASE_URL || "https://api.flutterwave.com/v3",
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      },
      validateStatus: () => true,
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === "ECONNABORTED") {
          logger.error("Flutterwave request timeout:", {
            url: error.config?.url,
            timeout: error.config?.timeout,
          });
          throw new AppError(408, "Request timeout - please try again");
        }
        throw error;
      },
    );
  }

  private isSuccessResponse(status: string): boolean {
    return status === "success";
  }

  private formatPhoneNumber(phone: string): string {
    return phone.startsWith("234") ? phone : "234" + phone.replace(/^0/, "");
  }

  async nameEnquiry(
    accountNumber: string,
    accountBank: string,
  ): Promise<{ accountNumber: string; accountName: string; bankCode: string }> {
    try {
      const response = await this.client.post("/accounts/resolve", {
        account_number: accountNumber,
        account_bank: accountBank,
      });

      if (
        response.status !== 200 ||
        !this.isSuccessResponse(response.data.status)
      ) {
        logger.error("Flutterwave name enquiry failed:", {
          status: response.status,
          data: response.data,
        });
        throw new AppError(
          response.status,
          response.data?.message || "Account verification failed",
        );
      }

      logger.info(`Flutterwave: Verified account: ${accountNumber}`);
      return {
        accountNumber: response.data.data.account_number,
        accountName: response.data.data.account_name,
        bankCode: accountBank,
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Flutterwave: Error verifying bank account:", error);
      throw new AppError(
        error.response?.status || 400,
        error.response?.data?.message || "Account verification failed",
      );
    }
  }

  async getBanks(country: string = "NG"): Promise<FlutterwaveBankData[]> {
    try {
      const response = await this.client.get(`/banks/${country}`);

      if (
        response.status !== 200 ||
        !this.isSuccessResponse(response.data.status)
      ) {
        logger.error("Failed to fetch banks:", {
          status: response.status,
          data: response.data,
        });
        throw new AppError(
          response.status,
          response.data?.message || "Failed to fetch banks",
        );
      }

      logger.info(`Flutterwave: Fetched banks for ${country}`);
      return response.data.data;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Flutterwave: Error fetching banks:", error);
      throw new AppError(500, "Failed to fetch banks");
    }
  }

  async createVirtualAccount(data: {
    email: string;
    firstname: string;
    lastname: string;
    reference: string;
    bvn: string;
    phone?: string;
    isPermanent?: boolean;
    amount?: number;
  }): Promise<FlutterwaveAccountData> {
    try {
      const payload: any = {
        email: data.email,
        is_permanent: data.isPermanent !== false,
        bvn: data.bvn,
        tx_ref: data.reference,
        firstname: data.firstname,
        lastname: data.lastname,
        narration: `${data.firstname} ${data.lastname}`,
      };

      if (data.phone) {
        payload.phonenumber = data.phone.startsWith("234")
          ? data.phone
          : "234" + data.phone.replace(/^0/, "");
      }

      if (!data.isPermanent && data.amount) {
        payload.amount = data.amount;
      }

      logger.info("Creating Flutterwave virtual account:", {
        email: payload.email,
        isPermanent: payload.is_permanent,
      });

      const response = await this.client.post(
        "/virtual-account-numbers",
        payload,
      );

      if (
        response.status !== 200 ||
        !this.isSuccessResponse(response.data.status)
      ) {
        logger.error("Failed to create virtual account:", {
          status: response.status,
          data: response.data,
        });
        throw new AppError(
          response.status,
          response.data?.message || "Failed to create virtual account",
        );
      }

      logger.info(`Flutterwave: Created virtual account for ${data.email}`);
      return response.data.data;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Flutterwave: Error creating virtual account:", error);
      throw new AppError(
        error.response?.status || 400,
        error.response?.data?.message || "Failed to create virtual account",
      );
    }
  }

  async createVirtualAccountForTransfer(data: {
    email: string;
    firstname: string;
    lastname: string;
    reference: string;
    bvn: string;
    phone?: string;
    isPermanent?: boolean;
    amount?: number;
  }): Promise<FlutterwaveAccountData> {
    try {
      const payload: any = {
        email: data.email,
        is_permanent: data.isPermanent !== false,
        bvn: data.bvn,
        tx_ref: data.reference,
        firstname: data.firstname,
        lastname: data.lastname,
        narration: `${data.firstname} ${data.lastname}`,
      };

      if (data.phone) {
        payload.phonenumber = this.formatPhoneNumber(data.phone);
        logger.debug("Formatted phone number:", {
          original: data.phone,
          formatted: payload.phonenumber,
        });
      }

      if (!data.isPermanent && data.amount) {
        payload.amount = data.amount;
      }

      const response = await this.client.post(
        "/virtual-account-numbers",
        payload,
      );

      if (
        response.status !== 200 ||
        !this.isSuccessResponse(response.data.status)
      ) {
        throw new AppError(
          response.status,
          response.data?.message || "Failed to create virtual account",
        );
      }

      logger.info(`Flutterwave: Created virtual account for ${data.email}`);
      return response.data.data;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Flutterwave: Error creating virtual account:", error);
      throw new AppError(
        error.response?.status || 400,
        error.response?.data?.message || "Failed to create virtual account",
      );
    }
  }

  async initiateCardPayment(data: {
    txRef: string;
    amount: number;
    currency?: string;
    redirectUrl: string;
    customerEmail: string;
    customerName: string;
    customerPhone?: string;
  }): Promise<FlutterwavePaymentInitResponse> {
    try {
      const payload: any = {
        tx_ref: data.txRef,
        amount: data.amount,
        currency: data.currency || "NGN",
        redirect_url: data.redirectUrl,
        customer: {
          email: data.customerEmail,
          name: data.customerName,
          phonenumber: data.customerPhone,
        },
        customizations: {
          title: "Order Payment",
          description: "Pay for your order",
        },
        payment_options: "card",
      };

      const response = await this.client.post("/payments", payload);

      if (
        response.status !== 200 ||
        !this.isSuccessResponse(response.data.status)
      ) {
        throw new AppError(
          response.status,
          response.data?.message || "Card payment initiation failed",
        );
      }

      logger.info(`Flutterwave: Card payment initiated: ${data.txRef}`);
      return {
        paymentUrl: response.data.data.link,
        reference: data.txRef,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Flutterwave: Error initiating card payment:", error);
      throw new AppError(
        error.response?.status || 400,
        error.response?.data?.message || "Card payment initiation failed",
      );
    }
  }

  async getVirtualAccountDetails(
    orderRef: string,
  ): Promise<FlutterwaveAccountData> {
    try {
      const response = await this.client.get(
        `/virtual-account-numbers/${orderRef}`,
      );

      if (
        response.status !== 200 ||
        !this.isSuccessResponse(response.data.status)
      ) {
        logger.error("Failed to get virtual account details:", {
          status: response.status,
          data: response.data,
        });
        throw new AppError(
          response.status,
          response.data?.message || "Failed to get account details",
        );
      }

      logger.info(`Flutterwave: Retrieved account details: ${orderRef}`);
      return response.data.data;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Flutterwave: Error getting account details:", error);
      throw new AppError(
        error.response?.status || 400,
        error.response?.data?.message || "Failed to get account details",
      );
    }
  }

  async updateVirtualAccountBVN(data: {
    orderRef: string;
    bvn: string;
  }): Promise<FlutterwaveAccountData> {
    try {
      const response = await this.client.put(
        `/virtual-account-numbers/${data.orderRef}`,
        {
          bvn: data.bvn,
        },
      );

      if (
        response.status !== 200 ||
        !this.isSuccessResponse(response.data.status)
      ) {
        logger.error("Failed to update virtual account BVN:", {
          status: response.status,
          data: response.data,
        });
        throw new AppError(
          response.status,
          response.data?.message || "Failed to update account BVN",
        );
      }

      logger.info(`Flutterwave: Updated BVN for account: ${data.orderRef}`);
      return response.data.data;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Flutterwave: Error updating account BVN:", error);
      throw new AppError(
        error.response?.status || 400,
        error.response?.data?.message || "Failed to update account BVN",
      );
    }
  }

  async verifyTransaction(transactionId: string): Promise<any> {
    try {
      const response = await this.client.get(
        `/transactions/${transactionId}/verify`,
      );

      if (
        response.status !== 200 ||
        !this.isSuccessResponse(response.data.status)
      ) {
        logger.error("Transaction verification failed:", {
          status: response.status,
          data: response.data,
        });
        throw new AppError(
          response.status,
          response.data?.message || "Transaction verification failed",
        );
      }

      logger.info(`Flutterwave: Verified transaction: ${transactionId}`);
      return response.data.data;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Flutterwave: Error verifying transaction:", error);
      throw new AppError(
        error.response?.status || 400,
        error.response?.data?.message || "Transaction verification failed",
      );
    }
  }

  async initiateTransfer(data: {
    accountBank: string;
    accountNumber: string;
    amount: number;
    narration: string;
    reference: string;
    currency?: string;
    callbackUrl?: string;
    beneficiaryName?: string;
  }): Promise<FlutterwaveTransferData> {
    try {
      const payload: any = {
        account_bank: data.accountBank,
        account_number: data.accountNumber,
        amount: data.amount,
        narration: data.narration,
        currency: data.currency || "NGN",
        reference: data.reference,
        callback_url: data.callbackUrl,
        debit_currency: data.currency || "NGN",
      };

      if (data.beneficiaryName) {
        payload.beneficiary_name = data.beneficiaryName;
      }

      logger.info("Initiating Flutterwave transfer:", {
        reference: data.reference,
        amount: data.amount,
        accountNumber: data.accountNumber,
      });

      const response = await this.client.post("/transfers", payload);

      if (
        response.status !== 200 ||
        !this.isSuccessResponse(response.data.status)
      ) {
        logger.error("Transfer initiation failed:", {
          status: response.status,
          data: response.data,
        });
        throw new AppError(
          response.status,
          response.data?.message || "Transfer failed",
        );
      }

      logger.info(`Flutterwave: Transfer initiated: ${data.reference}`);
      return response.data.data;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Flutterwave: Error initiating transfer:", error);
      throw new AppError(
        error.response?.status || 400,
        error.response?.data?.message || "Transfer failed",
      );
    }
  }

  async getTransferStatus(transferId: string): Promise<any> {
    try {
      const response = await this.client.get(`/transfers/${transferId}`);

      if (
        response.status !== 200 ||
        !this.isSuccessResponse(response.data.status)
      ) {
        logger.error("Failed to get transfer status:", {
          status: response.status,
          data: response.data,
        });
        throw new AppError(
          response.status,
          response.data?.message || "Failed to get transfer status",
        );
      }

      logger.info(`Flutterwave: Retrieved transfer status: ${transferId}`);
      return {
        ...response.data.data,
        _fullResponse: response.data,
        _provider: "flutterwave",
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Flutterwave: Error getting transfer status:", error);
      throw new AppError(
        error.response?.status || 400,
        error.response?.data?.message || "Failed to get transfer status",
      );
    }
  }

  async retryTransfer(transferId: string): Promise<FlutterwaveTransferData> {
    try {
      const response = await this.client.post(
        `/transfers/${transferId}/retries`,
      );

      if (
        response.status !== 200 ||
        !this.isSuccessResponse(response.data.status)
      ) {
        logger.error("Transfer retry failed:", {
          status: response.status,
          data: response.data,
        });
        throw new AppError(
          response.status,
          response.data?.message || "Transfer retry failed",
        );
      }

      logger.info(`Flutterwave: Retried transfer: ${transferId}`);
      return response.data.data;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Flutterwave: Error retrying transfer:", error);
      throw new AppError(
        error.response?.status || 400,
        error.response?.data?.message || "Transfer retry failed",
      );
    }
  }

  async getTransferFee(
    amount: number,
    currency: string = "NGN",
  ): Promise<number> {
    try {
      const response = await this.client.get("/transfers/fee", {
        params: { amount, currency },
      });

      if (
        response.status !== 200 ||
        !this.isSuccessResponse(response.data.status)
      ) {
        logger.warn("Failed to get transfer fee, using default");
        return this.calculateDefaultFee(amount);
      }

      logger.info(`Flutterwave: Retrieved transfer fee for amount: ${amount}`);
      return response.data.data[0]?.fee || this.calculateDefaultFee(amount);
    } catch (error: any) {
      logger.error("Flutterwave: Error getting transfer fee:", error);
      return this.calculateDefaultFee(amount);
    }
  }

  private calculateDefaultFee(amount: number): number {
    if (amount <= 5000) return 10.75;
    if (amount <= 50000) return 26.88;
    return 53.75;
  }

  async getWalletBalance(
    currency: string = "NGN",
  ): Promise<FlutterwaveBalanceData> {
    try {
      const response = await this.client.get(`/balances/${currency}`);

      if (
        response.status !== 200 ||
        !this.isSuccessResponse(response.data.status)
      ) {
        logger.error("Failed to get wallet balance:", {
          status: response.status,
          data: response.data,
        });
        throw new AppError(
          response.status,
          response.data?.message || "Failed to get wallet balance",
        );
      }

      logger.info(`Flutterwave: Retrieved wallet balance for ${currency}`);
      return response.data.data;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Flutterwave: Error getting wallet balance:", error);
      throw new AppError(500, "Failed to get wallet balance");
    }
  }

  async verifyBVN(bvn: string): Promise<any> {
    try {
      const response = await this.client.get(`/kyc/bvns/${bvn}`);

      if (
        response.status !== 200 ||
        !this.isSuccessResponse(response.data.status)
      ) {
        logger.error("BVN verification failed:", {
          status: response.status,
          data: response.data,
        });
        throw new AppError(
          response.status,
          response.data?.message || "BVN verification failed",
        );
      }

      logger.info(`Flutterwave: Verified BVN: ${bvn.substring(0, 3)}***`);
      return response.data.data;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Flutterwave: Error verifying BVN:", error);
      throw new AppError(
        error.response?.status || 400,
        error.response?.data?.message || "BVN verification failed",
      );
    }
  }

  async getTransactions(params?: {
    from?: string;
    to?: string;
    page?: number;
    currency?: string;
    status?: string;
  }): Promise<any> {
    try {
      const response = await this.client.get("/transactions", {
        params: {
          from: params?.from,
          to: params?.to,
          page: params?.page || 1,
          currency: params?.currency,
          status: params?.status,
        },
      });

      if (
        response.status !== 200 ||
        !this.isSuccessResponse(response.data.status)
      ) {
        logger.error("Failed to get transactions:", {
          status: response.status,
          data: response.data,
        });
        throw new AppError(
          response.status,
          response.data?.message || "Failed to get transactions",
        );
      }

      logger.info("Flutterwave: Retrieved transactions");
      return response.data.data;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Flutterwave: Error getting transactions:", error);
      throw new AppError(500, "Failed to get transactions");
    }
  }
}
