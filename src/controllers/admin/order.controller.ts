import { Request, Response, NextFunction } from "express";
import { OrderService } from "../../services/admin/Order.Service";

const orderService = new OrderService();

export const getOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const filter = req.query;
  try {
    const response = await orderService.getOrders(filter);
    return res
      .status(200)
      .json({ message: "Orders fetched successfully", data: response });
  } catch (error: any) {
    next(error);
  }
};

export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body;
  try {
    const response = await orderService.updateOrderStatus(payload);
    return res.status(200).json({
      message: "Order status updated successfully",
      data: response,
    });
  } catch (error: any) {
    next(error);
  }
};
