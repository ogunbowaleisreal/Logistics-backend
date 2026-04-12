import { Request, Response, NextFunction } from "express";
import { BankService } from "../../services/client/Bank.Service";
import logger from "../../../logger";
import AppError from "../../utilities/ErrorHandler";
import { ExtendedRequest } from "../../utilities/Interfaces";

const bankService = new BankService();
export const getBank = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const bank = await bankService.getBank(req.businessId!);
    return res
      .status(200)
      .json({ message: "Bank fetched successfully", data: bank });
  } catch (error: any) {
    next(error);
  }
};
