import { Response } from "express";
import AppError from "../../utilities/ErrorHandler";
import { ExtendedRequest } from "../../utilities/Interfaces";
import { OrderService } from "../../services/rider/Order.Service";

const orderService = new OrderService();

export const getMyOrders = async (
  req: ExtendedRequest,
  res: Response,
): Promise<Response> => {
  try {
    const riderId = req.rider!.riderId;
    const businessId = req.rider!.businessId;
    const orders = await orderService.getMyOrders(
      riderId,
      businessId,
      req.query,
    );

    return res
      .status(200)
      .json({ message: "Orders fetched successfully", data: orders });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (
  req: ExtendedRequest,
  res: Response,
): Promise<Response> => {
  try {
    const riderId = req.rider!.riderId;
    const businessId = req.rider!.businessId;
    const order = await orderService.updateOrderStatus(
      riderId,
      businessId,
      req.params.orderId,
      req.body.status,
    );

    return res.status(200).json({
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error: any) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: error.message });
  }
};
