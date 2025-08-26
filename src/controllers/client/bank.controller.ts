import { Request, Response } from "express";
import { BankService } from "../../services/client/Bank.Service";
import logger from "../../../logger";
import AppError from "../../utilities/ErrorHandler";

const bankService = new BankService();
export const getBank = async (req: Request, res: Response) => {
  try {
    const bank = await bankService.getBank();
    return res
      .status(200)
      .json({ message: "Bank fetched successfully", data: bank });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};
