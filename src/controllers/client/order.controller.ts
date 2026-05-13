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

export const checkoutOrder = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const response = await orderService.checkoutOrder(
      req.businessId!,
      req.body,
    );
    return res
      .status(200)
      .json({ message: "Order checked out successfully", data: response });
  } catch (error: any) {
    next(error);
  }
};

export const verifyMonnifyPaymentViaWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const signature = req.headers["monnify-signature"] as string;
    await orderService.verifyMonnifyPaymentViaWebhook(req.body, signature);
    return res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error: any) {
    next(error);
  }
};

export const verifySafehavenPaymentViaWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { orderID } = req.params;
    await orderService.verifySafehavenPaymentViaWebhook(orderID, req.body);
    return res.status(200).json({ message: "Webhook processed successfully" });
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

export const cancelOrder = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const response = await orderService.cancelOrder(req.businessId!, req.body);
    return res.status(200).json({
      message: "Order canceled successfully",
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
