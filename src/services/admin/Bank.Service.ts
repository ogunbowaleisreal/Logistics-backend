import axios from "axios";
import { Bank } from "../../models/Bank.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModel } from "../../utilities/Pagination.Helper";
import { tenantScope } from "../../utilities/TenantScope";

export class BankService {
  public async getBankCodes() {
    const secretKey = process.env["PAYSTACK_SECRET_KEY"] as string;
    const url = "https://api.paystack.co/bank";
    const options = {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
    };
    const response = await axios.get(url, options);

    if (response.statusText != "OK") {
      throw new Error(`Request failed with status ${response.status}`);
    }
    const { data } = response;
    return data;
  }

  public async verifyBank(payload: any) {
    const { bankCode, accountNumber } = payload;
    const secretKey = process.env["PAYSTACK_SECRET_KEY"];
    const url = `https://api.paystack.co/bank/resolve`;
    const options = {
      headers: {
        Authorization: `Bearer ${secretKey}`,
      },
      params: {
        account_number: accountNumber,
        bank_code: bankCode,
      },
    };
    const response = await axios.get(url, options);
    if (response.statusText != "OK") {
      throw new Error(`Request failed with status ${response.status}`);
    }
    return response.data.data;
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

  // public async updateBank(payload: any) {
  //   const { bankID, ...rest } = payload;
  //   const bank = await Bank.findOne({ _id: bankID, isDeleted: false }, rest, {
  //     new: true,
  //   });
  //   if (!bank) throw new AppError(404, "Bank not found");
  //   return bank;
  // }

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
