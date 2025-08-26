import { Transaction } from "../../models/Transaction.Model";
import AppError from "../../utilities/ErrorHandler";
import {
  paginateModel,
  paginateModelWithMultiplePopulates,
} from "../../utilities/Pagination.Helper";

export class TransactionService {
  public async getTransactions(filter: any) {
    const { transactionID, accountID, status, type, page, limit } = filter;

    if (transactionID) {
      const transaction = await Transaction.findOne({ _id: transactionID });
      if (!transaction) throw new AppError(404, "Transaction not found");
      return transaction;
    }
    let query: any = {};
    if (status) {
      query.status = status;
    }
    if (type) {
      query.type = type;
    }
    if (accountID) {
      query.accountID = accountID;
    }
    const transactions = await paginateModelWithMultiplePopulates(
      Transaction,
      query,
      page,
      limit,
      [
        { path: "accountID", select: "firstname lastname email" },
        { path: "itemID", select: "name" },
      ]
    );
    return transactions;
  }

  public async updateTransaction(payload: {
    transactionID: string;
    status: string;
  }) {
    return;
  }
}
