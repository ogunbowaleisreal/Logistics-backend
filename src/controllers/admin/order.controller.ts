import { Request, Response, NextFunction } from "express";
import { OrderService } from "../../services/admin/Order.Service";

const orderService = new OrderService();

export const getOrders = async (
  req: Request | any,
  res: Response,
  next: NextFunction,
) => {
  const filter = req.query;
  const businessId =
    req.business?.businessId ??
    req.staff?.businessId ??
    req.query.businessId ??
    req.body?.businessId;
  try {
    const response = await orderService.getOrders(businessId, filter);
    return res
      .status(200)
      .json({ message: "Orders fetched successfully", data: response });
  } catch (error: any) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: Request | any,
  res: Response,
  next: NextFunction,
) => {
  const payload = req.body;
  const businessId =
    req.business?.businessId ??
    req.staff?.businessId ??
    req.query.businessId ??
    req.body?.businessId;
  try {
    const response = await orderService.updateOrderStatus(businessId, payload);
    return res.status(200).json({
      message: "Order status updated successfully",
      data: response,
    });
  } catch (error: any) {
    next(error);
  }
};
