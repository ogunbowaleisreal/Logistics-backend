import { Bank } from "../../models/Bank.Model";
import AppError from "../../utilities/ErrorHandler";

export class BankService {
  public async getBank() {
    const bank = await Bank.findOne({
      status: "active",
      isDefault: true,
      isDeleted: false,
    });
    if (!bank) throw new AppError(500, "Bank not found, please contact admin");
    return bank;
  }

  public async validateBank(bankID: string) {
    const bank = await Bank.findOne({
      _id: bankID,
      status: "active",
      isDeleted: false,
    });
    if (!bank) throw new AppError(500, "Bank not found");
    return bank;
  }
}
