import { NextFunction, Request, Response } from "express";
import { BusinessService } from "../../services/admin/Business.Service";

const businessService = new BusinessService();

export const getBusinesses = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const businesses = await businessService.getBusinesses(req.query);
    return res
      .status(200)
      .json({ message: "Businesses fetched successfully", data: businesses });
  } catch (error: any) {
    next(error);
  }
};

export const updateBusinessStatus = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { businessId, status } = req.body as {
    businessId: string;
    status: "active" | "suspended";
  };

  try {
    const business = await businessService.updateBusinessStatus(
      businessId,
      status,
    );
    return res
      .status(200)
      .json({ message: `Business ${status} successfully`, data: business });
  } catch (error: any) {
    next(error);
  }
};

export const deleteBusiness = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { businessId } = req.query as { businessId: string };

  try {
    await businessService.deleteBusiness(businessId);
    return res.status(200).json({ message: "Business deleted successfully" });
  } catch (error: any) {
    next(error);
  }
};
