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

export const suspendBusiness = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { businessId } = req.body as { businessId: string };

  try {
    const business = await businessService.suspendBusiness(businessId);
    return res
      .status(200)
      .json({ message: "Business suspended successfully", data: business });
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
