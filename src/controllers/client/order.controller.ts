import { Request, Response, NextFunction } from "express";
import { OrderService } from "../../services/client/Order.Service";
import { ExtendedRequest } from "../../utilities/Interfaces";

const orderService = new OrderService();

export const createOrder = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const response = await orderService.createOrder(req.businessId!, req.body);
    return res
      .status(200)
      .json({ message: "Order created successfully", data: response });
  } catch (error: any) {
    next(error);
  }
};

export const getOrderSummary = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  const { orderID } = req.query as { orderID: string };
  try {
    const response = await orderService.getOrderSummary(
      req.businessId!,
      orderID,
    );
    return res
      .status(200)
      .json({ message: "Order summary fetched successfully", data: response });
  } catch (error: any) {
    next(error);
  }
};

export const trackOrder = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  const { trackingID } = req.query as { trackingID: string };
  try {
    const response = await orderService.trackOrder(req.businessId!, trackingID);
    return res.status(200).json({
      message: "Order tracking information fetched successfully",
      data: response,
    });
  } catch (error: any) {
    next(error);
  }
};

export const provideProofOfPayment = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  const payload = req.body;
  try {
    const response = await orderService.provideProofOfPayment(
      req.businessId!,
      payload,
    );
    return res.status(200).json({
      message: "Proof of payment provided successfully",
      data: response,
    });
  } catch (error: any) {
    next(error);
  }
};

export const cancelOrder = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const response = await orderService.cancelOrder(req.businessId!, req.body);
    return res.status(200).json({
      message: "Order cancelled successfully",
      data: response,
    });
  } catch (error: any) {
    next(error);
  }
};

export const getMyOrders = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { phone, page, limit } = req.query;
    const response = await orderService.getMyOrders(req.businessId!, {
      phone: String(phone),
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    return res.status(200).json({
      message: "Orders fetched successfully",
      data: response,
    });
  } catch (error: any) {
    next(error);
  }
};

export const generateImageUploadSignature = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const response = await orderService.generateImageUploadSignature();
    return res.status(200).json({
      message: "Image upload signature generated successfully",
      data: response,
    });
  } catch (error: any) {
    next(error);
  }
};
