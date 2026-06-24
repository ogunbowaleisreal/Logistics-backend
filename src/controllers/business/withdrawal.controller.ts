import { Request, Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import { WithdrawalService } from "../../services/business/Withdrawal.Service";

const withdrawalService = new WithdrawalService();

export const requestWithdrawal = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.business?.businessId;
    const { amount, bankId, bankDetails, saveAccount } = req.body;

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "A valid amount is required" });
    }

    if (bankDetails !== undefined) {
      if (
        typeof bankDetails !== "object" ||
        typeof bankDetails.bankCode !== "string" ||
        !bankDetails.bankCode.trim() ||
        typeof bankDetails.accountNumber !== "string" ||
        !bankDetails.accountNumber.trim()
      ) {
        return res.status(400).json({
          message:
            "bankDetails must include a valid bankCode and accountNumber",
        });
      }
    }

    const withdrawal = await withdrawalService.requestWithdrawal(
      businessId,
      amount,
      bankId,
      bankDetails,
      saveAccount === true,
    );
    return res
      .status(201)
      .json({ message: "Withdrawal initiated successfully", data: withdrawal });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const getWithdrawals = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.business?.businessId;
    const withdrawals = await withdrawalService.getWithdrawals(
      businessId,
      req.query,
    );
    return res
      .status(200)
      .json({ message: "Withdrawals fetched successfully", data: withdrawals });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};
