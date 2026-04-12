import { Bank } from "../../models/Bank.Model";
import AppError from "../../utilities/ErrorHandler";
import { tenantScope } from "../../utilities/TenantScope";

export class BankService {
  public async getBank(businessId: string) {
    const banks = await Bank.find(
      tenantScope(
        {
          status: "active",
          isDeleted: false,
        },
        businessId,
      ),
    );
    if (banks.length === 0)
      throw Error("Banks not found, please contact admin");
    return banks;
  }

  public async validateBank(businessId: string, bankID: string) {
    const bank = await Bank.findOne(
      tenantScope(
        {
          _id: bankID,
          status: "active",
          isDeleted: false,
        },
        businessId,
      ),
    );
    if (!bank) throw new AppError(500, "Bank not found");
    return bank;
  }
}
