import { randomUUID } from "crypto";
import { startSession } from "mongoose";
import { Business } from "../../models/Business.Model";
import { Bank, BankList } from "../../models/Bank.Model";
import { Withdrawal } from "../../models/Withdrawal.Model";
import AppError from "../../utilities/ErrorHandler";
import { SafeHaven } from "../../utilities/SafeHaven";
import { paginateModel } from "../../utilities/Pagination.Helper";
import { tenantScope } from "../../utilities/TenantScope";

const safehaven = new SafeHaven();

export class WithdrawalService {
  public async requestWithdrawal(
    businessId: string,
    amount: number,
    bankID?: string,
    inlineBank?: { bankCode: string; accountNumber: string },
    saveAccount?: boolean,
  ) {
    const business = await Business.findById(businessId)
      .select("wallet")
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

    // const nameEnquiryReference = await safehaven.makeNameEnquiry({
    //   bankCode: bankSnapshot.bankCode,
    //   accountNumber: bankSnapshot.accountNumber,
    // });

    const reference = `WD-${randomUUID()}`;

    // const safehavenResponse = await safehaven.makeTransfer({
    //   amount,
    //   reference,
    //   beneficiaryAccountNumber: bankSnapshot.accountNumber,
    //   beneficiaryBankCode: bankSnapshot.bankCode,
    //   nameEnquiryReference,
    // });

    const session = await startSession();
    const transaction = await session.withTransaction(async () => {
      await Business.findByIdAndUpdate(
        businessId,
        { $inc: { "wallet.naira": -amount } },
        { session },
      );

      const [withdrawal] = await Withdrawal.create(
        [
          {
            businessId,
            ...(bankId && { bankId }),
            amount,
            reference,
            status: "successful",
            bankSnapshot,
            sessionId: "00000000000000000000000",
          },
        ],
        { session },
      );

      return withdrawal;
    });

    await session.endSession();

    return transaction;
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
}
