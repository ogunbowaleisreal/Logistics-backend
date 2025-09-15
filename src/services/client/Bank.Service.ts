import { Bank } from "../../models/Bank.Model";
import AppError from "../../utilities/ErrorHandler";

export class BankService {
  public async getBank() {
    const banks = await Bank.find({
      status: "active",
      isDeleted: false,
    });
    if (banks.length === 0)
      throw Error("Banks not found, please contact admin");
    return banks;
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
