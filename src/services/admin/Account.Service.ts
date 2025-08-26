import { Account } from "../../models/Account.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModel } from "../../utilities/Pagination.Helper";

export class AccountService {
  public async getAccounts(filter: any) {
    const { accountID, type, search, status, page, limit, sort } = filter;

    if (accountID) {
      const account = await Account.findOne({ _id: accountID });
      if (!account) throw new AppError(404, "Account not found!");
      return account;
    }

    const sortQuery: any = sort ? { [sort]: -1 } : { createdAt: -1 };

    const query: any = {};
    if (search) {
      query.$or = [
        { firstname: { $regex: search, $options: "i" } },
        { lastname: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status.toLowerCase();
    }

    if (type) {
      query.type = type;
    }

    const account = await paginateModel(Account, query, page, limit, sortQuery);
    return account;
  }

  public async updateAccountSatus(payload: any) {
    const { accountID, status } = payload;
    const updatedAccount = await Account.findOneAndUpdate(
      { _id: accountID },
      { status },
      { new: true }
    );
    if (!updatedAccount) {
      throw new AppError(404, "Account not found");
    }
    return updatedAccount;
  }
}
