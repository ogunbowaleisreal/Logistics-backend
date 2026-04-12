import { Request, Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import { BankService } from "../../services/admin/Bank.Service";

const bankService = new BankService();

export const getBankCodes = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const bank = await bankService.getBankCodes();
    return res
      .status(200)
      .json({ message: "Bank code fetched successfully", data: bank });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const verifyBank = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const bank = await bankService.verifyBank(req.body);
    return res
      .status(200)
      .json({ message: "Bank verification successful", data: bank });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const createBank = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const bank = await bankService.createBank(businessId, req.body);
    return res
      .status(201)
      .json({ message: "Bank created successfully", data: bank });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const getBanks = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const banks = await bankService.getBanks(businessId, req.query);
    return res
      .status(200)
      .json({ message: "Bank fetched successfully", data: banks });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const deleteBank = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  const { bankID } = req.query as { bankID: string };
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    await bankService.deleteBank(businessId, bankID);
    return res.status(200).json({ message: "Bank deleted successfully" });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const setDefaultBank = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  const { bankID } = req.body as { bankID: string };
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const bank = await bankService.setDefaultBank(businessId, bankID);
    return res
      .status(200)
      .json({ message: "Bank updated successfully", data: bank });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};
