import { ExtendedRequest } from "../../utilities/Interfaces";
import { Request, Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import { AccountService } from "../../services/admin/Account.Service";
import logger from "../../../logger";

const accountService = new AccountService();

export const getAccounts = async (req: ExtendedRequest, res: Response) => {
  const filter = req.query;
  try {
    const account = await accountService.getAccounts(filter);
    return res
      .status(200)
      .json({ message: "Accounts fetched successfully", data: account });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const updateAccountSatus = async (
  req: ExtendedRequest,
  res: Response
) => {
  const payload = req.body;
  try {
    const account = await accountService.updateAccountSatus(payload);
    return res
      .status(200)
      .json({ message: "Account updated successfully", data: account });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};
