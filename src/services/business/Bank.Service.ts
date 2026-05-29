import axios from "axios";
import { Bank, BankList } from "../../models/Bank.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModel } from "../../utilities/Pagination.Helper";
import { tenantScope } from "../../utilities/TenantScope";
import { SafeHaven } from "../../utilities/SafeHaven";

const safeHaven = new SafeHaven();

export class BankService {
  public async getBankList() {
    const bankList = await BankList.find();
    return bankList;
  }

  public async verifyBank(filter: any) {
    const { bankCode, accountNumber } = filter;

    const response = await safeHaven.verifyBank({
      bankCode,
      accountNumber,
    });

    return {
      bankCode,
      accountNumber,
      accountName: response.accountName,
    };
  }

  public async createBank(businessId: string, payload: any) {
    const bank = await Bank.create({ ...payload, businessId });

    const bankCount = await Bank.countDocuments(
      tenantScope({ status: "active", isDeleted: false }, businessId),
    );
    if (bankCount === 1) {
      bank.isDefault = true;
      await bank.save();
    }
    return bank;
  }

  public async getBanks(businessId: string, filter: any) {
    const { bankID, status, page, limit } = filter;
    if (bankID) {
      const bank = await Bank.findOne(
        tenantScope({ _id: bankID, isDeleted: false }, businessId),
      );
      if (!bank) throw new AppError(404, "Bank not found");
      return bank;
    }
    let query: any = { isDeleted: false };
    if (status) {
      query.status = status;
    }
    const banks = await paginateModel(
      Bank,
      tenantScope(query, businessId),
      page,
      limit,
    );
    return banks;
  }

  public async deleteBank(businessId: string, bankID: string) {
    const bank = await Bank.findOneAndUpdate(
      tenantScope({ _id: bankID, isDeleted: false }, businessId),
      { isDeleted: true },
    );
    if (!bank) throw new AppError(404, "Bank not found");
    return;
  }

  public async setDefaultBank(businessId: string, bankID: string) {
    await Bank.findOneAndUpdate(
      tenantScope({ isDefault: true, isDeleted: false }, businessId),
      { isDefault: false },
    );
    const updatedBank = await Bank.findOneAndUpdate(
      tenantScope({ _id: bankID, isDeleted: false }, businessId),
      { isDefault: true },
      { new: true },
    );
    if (!updatedBank) throw new AppError(404, "Bank not found");
    return updatedBank;
  }
}
