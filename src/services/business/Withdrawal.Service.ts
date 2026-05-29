import { randomUUID } from "crypto";
import { startSession } from "mongoose";
import { Business } from "../../models/Business.Model";
import { Bank } from "../../models/Bank.Model";
import { Withdrawal } from "../../models/Withdrawal.Model";
import AppError from "../../utilities/ErrorHandler";
import { SafeHaven } from "../../utilities/SafeHaven";
import { paginateModel } from "../../utilities/Pagination.Helper";
import { tenantScope } from "../../utilities/TenantScope";

const safehaven = new SafeHaven();

export class WithdrawalService {
  public async requestWithdrawal(businessId: string, amount: number) {
    const business = await Business.findById(businessId)
      .select("wallet")
      .lean();
    if (!business) throw new AppError(404, "Business not found");

    if (business.wallet.naira < amount) {
      throw new AppError(400, "Insufficient wallet balance");
    }

    const bank = await Bank.findOne(
      tenantScope(
        { isDefault: true, status: "active", isDeleted: false },
        businessId,
      ),
    );

    if (!bank) throw new AppError(400, "No default bank account set");

    // const nameEnquiryReference = await safehaven.makeNameEnquiry({
    //   bankCode: bank.bankCode,
    //   accountNumber: bank.accountNumber,
    // });

    const reference = `WD-${randomUUID()}`;

    // const safehavenResponse = await safehaven.makeTransfer({
    //   amount,
    //   reference,
    //   beneficiaryAccountNumber: bank.accountNumber,
    //   beneficiaryBankCode: bank.bankCode,
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
            bankId: bank._id,
            amount,
            reference,
            status: "successful",
            bankSnapshot: {
              accountName: bank.accountName,
              accountNumber: bank.accountNumber,
              bankName: bank.name,
              bankCode: bank.bankCode,
            },
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
