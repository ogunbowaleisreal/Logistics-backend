import { Request, Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import { OrderService } from "../../services/business/Order.Service";

const orderService = new OrderService();

export const getOrders = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const orders = await orderService.getOrders(businessId, req.query);
    return res
      .status(200)
      .json({ message: "Orders fetched successfully", data: orders });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.staff?.businessId ?? req.business?.businessId;
    const order = await orderService.updateOrderStatus(businessId, req.body);
    return res
      .status(200)
      .json({ message: "Order status updated successfully", data: order });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};

export const changeRider = async (
  req: Request | any,
  res: Response,
): Promise<Response> => {
  try {
    const businessId = req.business?.businessId ?? req.staff?.businessId;
    const { orderId } = req.params;
    const { riderID } = req.body;
    const order = await orderService.changeRider(businessId, orderId, riderID);

    return res
      .status(200)
      .json({ message: "Rider updated successfully", data: order });
  } catch (error: any) {
    if (error instanceof AppError)
      return res.status(error.statusCode).json({ message: error.message });
    return res.status(500).json({ message: error.message });
  }
};
