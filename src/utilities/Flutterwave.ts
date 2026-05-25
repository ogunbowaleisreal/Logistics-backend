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
          phonenumber: data.customerPhone
            ? this.formatPhoneNumber(data.customerPhone)
            : undefined,
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

      console.log(response.data);
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
}
