import { Request, Response } from "express";
import { BankService } from "../../services/admin/Bank.Service";
import AppError from "../../utilities/ErrorHandler";
import logger from "../../../logger";

const bankService = new BankService();

export const getBankCodes = async (req: Request, res: Response) => {
  try {
    const bank = await bankService.getBankCodes();
    return res
      .status(200)
      .json({ message: "Bank code fetched successfully", data: bank });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const verifyBank = async (req: Request, res: Response) => {
  const payload = req.body;
  try {
    const bank = await bankService.verifyBank(payload);
    return res
      .status(200)
      .json({ message: "Bank verification successful", data: bank });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const createBank = async (req: Request, res: Response) => {
  const payload = req.body;
  try {
    const bank = await bankService.createBank(payload);
    return res
      .status(201)
      .json({ message: "Bank created successfully", data: bank });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getBanks = async (req: Request, res: Response) => {
  const filter = req.query;
  try {
    const bank = await bankService.getBanks(filter);
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

// export const updateBank = async (req: Request, res: Response) => {
//   const payload = req.body;
//   try {
//     const bank = await bankService.updateBank(payload);
//     return res
//       .status(200)
//       .json({ message: "Bank updated successfully", data: bank });
//   } catch (error: any) {
//     if (error instanceof AppError) {
//       return res.status(error.statusCode).json({ message: error.message });
//     }
//     logger.error(error.message);
//     return res.status(500).json({ message: error.message });
//   }
// };

export const deleteBank = async (req: Request, res: Response) => {
  const { bankID } = req.query as { bankID: string };
  try {
    const bank = await bankService.deleteBank(bankID);
    return res.status(200).json({ message: "Bank deleted successfully" });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const setDefaultBank = async (req: Request, res: Response) => {
  const { bankID } = req.body;
  try {
    const bank = await bankService.setDefaultBank(bankID);
    return res
      .status(200)
      .json({ message: "Bank updated successfully", data: bank });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    logger.error(error.message);
    return res.status(500).json({ message: error.message });
  }
};
