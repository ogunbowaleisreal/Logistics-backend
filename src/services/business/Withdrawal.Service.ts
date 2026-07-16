import { startSession, Types } from "mongoose";
import { Business } from "../../models/Business.Model";
import { Bank, BankList } from "../../models/Bank.Model";
import { Withdrawal } from "../../models/Withdrawal.Model";
import AppError from "../../utilities/ErrorHandler";
import { SafeHaven } from "../../utilities/SafeHaven";
import { paginateModel } from "../../utilities/Pagination.Helper";
import { tenantScope } from "../../utilities/TenantScope";
import { EmailService } from "../Email.Service";
import { termiiService } from "../../utilities/Termii";
import logger from "../../../logger";

const safehaven = new SafeHaven();
const emailService = new EmailService();

export class WithdrawalService {
  public async requestWithdrawal(
    businessId: string,
    amount: number,
    bankID?: string,
    inlineBank?: { bankCode: string; accountNumber: string },
    saveAccount?: boolean,
  ) {
    const business = await Business.findById(businessId)
      .select("wallet email phone name")
      .lean();
    if (!business) throw new AppError(404, "Business not found");

    if (business.wallet.naira < amount) {
      throw new AppError(400, "Insufficient wallet balance");
    }

    let bankId: any = undefined;
    let bankSnapshot: {
      accountName: string;
      accountNumber: string;
      bankName: string;
      bankCode: string;
    };

    if (inlineBank) {
      const [verified, bankRecord] = await Promise.all([
        safehaven.verifyBank({
          bankCode: inlineBank.bankCode,
          accountNumber: inlineBank.accountNumber,
        }),
        BankList.findOne({ bankCode: inlineBank.bankCode }).lean(),
      ]);

      if (!bankRecord) throw new AppError(400, "Invalid bank code");

      bankSnapshot = {
        accountName: verified.accountName,
        accountNumber: inlineBank.accountNumber,
        bankName: bankRecord.name,
        bankCode: inlineBank.bankCode,
      };

      if (saveAccount) {
        const hasDefault = await Bank.exists(
          tenantScope(
            { isDefault: true, status: "active", isDeleted: false },
            businessId,
          ),
        );

        const savedBank = await Bank.create({
          businessId,
          name: bankRecord.name,
          bankCode: inlineBank.bankCode,
          accountName: verified.accountName,
          accountNumber: inlineBank.accountNumber,
          status: "active",
          isDefault: !hasDefault,
          isDeleted: false,
        });

        bankId = savedBank._id;
      }
    } else if (bankID) {
      const bank = await Bank.findOne(
        tenantScope(
          { _id: bankID, status: "active", isDeleted: false },
          businessId,
        ),
      );

      if (!bank) throw new AppError(400, "Bank account not found");

      bankId = bank._id;
      bankSnapshot = {
        accountName: bank.accountName,
        accountNumber: bank.accountNumber,
        bankName: bank.name,
        bankCode: bank.bankCode,
      };
    } else {
      const bank = await Bank.findOne(
        tenantScope(
          { isDefault: true, status: "active", isDeleted: false },
          businessId,
        ),
      );

      if (!bank) throw new AppError(400, "No default bank account set");

      bankId = bank._id;
      bankSnapshot = {
        accountName: bank.accountName,
        accountNumber: bank.accountNumber,
        bankName: bank.name,
        bankCode: bank.bankCode,
      };
    }

    const reference = await this.generateReference();

    const isDevelopment = process.env["NODE_ENV"] === "development";

    const notify = () => {
      void emailService.sendWithdrawalSuccessEmail({
        email: business.email,
        name: business.name,
        amount,
        reference,
        bankSnapshot,
      });
      if (business.phone) {
        void termiiService.sendWithdrawalSuccess(
          business.phone,
          business.name,
          amount,
          reference,
        );
      }
    };

    const session = await startSession();
    let withdrawal: any;
    try {
      withdrawal = await session.withTransaction(async () => {
        await Business.findByIdAndUpdate(
          businessId,
          { $inc: { "wallet.naira": -amount } },
          { session },
        );

        const [created] = await Withdrawal.create(
          [
            {
              businessId,
              ...(bankId && { bankId }),
              amount,
              reference,
              status: "pending",
              bankSnapshot,
            },
          ],
          { session },
        );

        return created;
      });
    } finally {
      await session.endSession();
    }

    if (isDevelopment) {
      withdrawal.sessionId = new Types.ObjectId().toString();
      withdrawal.status = "successful";
      await withdrawal.save();

      notify();
      return withdrawal;
    }

    let nameEnquiryReference: string;
    try {
      nameEnquiryReference = await safehaven.makeNameEnquiry({
        bankCode: bankSnapshot.bankCode,
        accountNumber: bankSnapshot.accountNumber,
      });
    } catch (error) {
      // No money has moved yet, so it's safe to reverse the debit.
      const refundSession = await startSession();
      try {
        await refundSession.withTransaction(async () => {
          await Business.findByIdAndUpdate(
            businessId,
            { $inc: { "wallet.naira": amount } },
            { session: refundSession },
          );
          await Withdrawal.findByIdAndUpdate(
            withdrawal._id,
            { status: "failed" },
            { session: refundSession },
          );
        });
      } finally {
        await refundSession.endSession();
      }
      throw error;
    }

    let transferSucceeded = false;
    try {
      const transferResult = await safehaven.makeTransfer({
        amount,
        reference,
        beneficiaryAccountNumber: bankSnapshot.accountNumber,
        beneficiaryBankCode: bankSnapshot.bankCode,
        nameEnquiryReference,
      });
      withdrawal.sessionId = transferResult.sessionId;
      transferSucceeded = true;
    } catch {
      logger.error(
        `Withdrawal transfer failed for ${withdrawal._id} (business ${businessId})`,
      );
      // Outcome is ambiguous (e.g. a timeout could mean the transfer
      // actually went through), so the debit is intentionally left in
      // place pending manual reconciliation rather than auto-refunded.
    }

    withdrawal.status = "processed";
    await withdrawal.save();

    if (transferSucceeded) {
      notify();
    }

    return withdrawal;
  }

  public async getWithdrawals(businessId: string, filter: any) {
    const { withdrawalId, page, limit } = filter;

    if (withdrawalId) {
      const withdrawal = await Withdrawal.findOne(
        tenantScope({ _id: withdrawalId }, businessId),
      );
      if (!withdrawal) throw new AppError(404, "Withdrawal not found");
      return withdrawal;
    }

    return paginateModel(Withdrawal, tenantScope({}, businessId), page, limit);
  }

  private async generateReference() {
    let reference: string;
    do {
      const timestamp = Date.now().toString();
      const random = Math.floor(
        100000000 + Math.random() * 900000000,
      ).toString();
      reference = `WD-${timestamp}${random}`;
    } while (await Withdrawal.exists({ reference }));
    return reference;
  }
}
