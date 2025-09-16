import { Request, Response, NextFunction } from "express";
import { OrderService } from "../../services/client/Order.Service";

const orderService = new OrderService();

export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = await orderService.createOrder(req.body);
    return res
      .status(200)
      .json({ message: "Order created successfully", data: response });
  } catch (error: any) {
    next(error);
  }
};

export const getOrderSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { orderID } = req.query as { orderID: string };
  try {
    const response = await orderService.getOrderSummary(orderID);
    return res
      .status(200)
      .json({ message: "Order summary fetched successfully", data: response });
  } catch (error: any) {
    next(error);
  }
};

export const trackOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { trackingID } = req.query as { trackingID: string };
  try {
    const response = await orderService.trackOrder(trackingID);
    return res.status(200).json({
      message: "Order tracking information fetched successfully",
      data: response,
    });
  } catch (error: any) {
    next(error);
  }
};

export const provideProofOfPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const payload = req.body;
  try {
    const response = await orderService.provideProofOfPayment(payload);
    return res.status(200).json({
      message: "Proof of payment provided successfully",
      data: response,
    });
  } catch (error: any) {
    next(error);
  }
};

export const generateImageUploadSignature = async (
  req: Request,
  res: Response,
  next: NextFunction
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
