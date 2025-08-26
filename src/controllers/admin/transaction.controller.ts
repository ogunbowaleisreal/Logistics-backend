import { Request, Response } from "express";
import { TransactionService } from "../../services/admin/Transaction.Service";
import AppError from "../../utilities/ErrorHandler";
import logger from "../../../logger";

const transactionService = new TransactionService();
export const getTransactions = async (req: Request, res: Response) => {
  const filter = req.query;
  try {
    const transactions = await transactionService.getTransactions(filter);
    return res.status(200).json({
      message: "Transactions fetched successfully",
      data: transactions,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const updateTransaction = async (req: Request, res: Response) => {
  const payload = req.body;
  try {
    const transaction = await transactionService.updateTransaction(payload);
    return res
      .status(200)
      .json({ message: "Transaction updated successfully", data: transaction });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};
