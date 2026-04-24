import { Order } from "../../models/Order.Model";
import AppError from "../../utilities/ErrorHandler";
import { IOrderPayload } from "../../utilities/Interfaces";
import ImageKit from "imagekit";
import { paginateModel } from "../../utilities/Pagination.Helper";
import { tenantScope } from "../../utilities/TenantScope";
import { resolveBusinessIdFromSlug } from "../../middlewares/authorization.middleware";
import { EmailService } from "../Email.Service";

const emailService = new EmailService();

export class OrderService {
  public async createOrder(_businessId: string, payload: IOrderPayload) {
    const { slug, orderInformation, personnelInformation, paymentMethod } =
      payload;
    const businessId = await resolveBusinessIdFromSlug(slug);

    const order = await Order.create({
      businessId,
      orderInformation,
      personnelInformation: {
        sender: {
          name: personnelInformation.sender.name,
          email: personnelInformation.sender.email,
          phone: personnelInformation.sender.phone,
        },
        receiver: {
          name: personnelInformation.receiver.name,
          phone: personnelInformation.receiver.phone,
        },
      },
      paymentMethod,
      amount: await this.computeOrderPrice(payload),
    });

    if (order.personnelInformation.sender.email) {
      void emailService.sendOrderConfirmation({
        email: order.personnelInformation.sender.email,
        name: order.personnelInformation.sender.name,
        trackingID: order.trackingID,
        amount: order.amount,
      });
    }

    return order;
  }

  public async getOrderSummary(businessId: string, orderID: string) {
    const order = await Order.findOne(
      tenantScope({ _id: orderID }, businessId),
    );
    if (!order) {
      throw new AppError(404, "Order not found");
    }
    return order;
  }

  public async provideProofOfPayment(
    businessId: string,
    payload: {
      orderID: string;
      bankID: string;
      proofOfPayment: string;
    },
  ) {
    const { orderID, bankID, proofOfPayment } = payload;

    const existingOrder = await Order.findOne(
      tenantScope({ _id: orderID }, businessId),
    );

    if (!existingOrder) {
      throw new AppError(404, "Order not found");
    }

    if (existingOrder.status !== "pending") {
      throw new AppError(
        400,
        "Proof of payment can only be submitted for pending orders",
      );
    }

    const order = await Order.findOneAndUpdate(
      tenantScope({ _id: orderID }, businessId),
      { proofOfPayment, bankID, status: "payment-review" },
      { new: true },
    );

    if (!order) {
      throw new AppError(404, "Order not found");
    }

    if (order.personnelInformation.sender.email) {
      void emailService.sendPaymentReviewNotification({
        email: order.personnelInformation.sender.email,
        name: order.personnelInformation.sender.name,
        trackingID: order.trackingID,
      });
    }

    return order;
  }

  public async generateImageUploadSignature() {
    var imagekit = new ImageKit({
      publicKey: process.env["IMAGE_KIT_PUBLIC_KEY"]!,
      privateKey: process.env["IMAGE_KIT_PRIVATE_KEY"]!,
      urlEndpoint: process.env["IMAGE_KIT_URL_ENDPOINT"]!,
    });

    const signature = imagekit.getAuthenticationParameters();

    return signature;
  }

  public async trackOrder(businessId: string, trackingID: string) {
    const validateTrackingID = trackingID.startsWith("SME-");
    if (!validateTrackingID) {
      trackingID = `SME-${trackingID}`;
    }
    const order = await Order.findOne({
      ...tenantScope({}, businessId),
      trackingID: trackingID.toUpperCase(),
    });
    if (!order) {
      throw new AppError(404, "Order not found");
    }
    return order;
  }

  public async cancelOrder(
    businessId: string,
    payload: { orderID: string; phone: string },
  ) {
    const { orderID, phone } = payload;
    const order = await Order.findOne(
      tenantScope({ _id: orderID }, businessId),
    );

    if (!order) {
      throw new AppError(404, "Order not found");
    }

    if (order.status !== "pending") {
      throw new AppError(400, "Order can only be cancelled when pending");
    }

    if (order.personnelInformation.sender.phone !== phone) {
      throw new AppError(403, "Unauthorized: phone does not match order");
    }

    order.status = "cancelled";
    await order.save();

    return order;
  }

  public async getMyOrders(
    businessId: string,
    payload: { phone: string; page?: number; limit?: number },
  ) {
    const { phone, page = 1, limit = 10 } = payload;

    return paginateModel(
      Order,
      tenantScope({ "personnelInformation.sender.phone": phone }, businessId),
      page,
      limit,
    );
  }

  public async computeOrderPrice(payload: IOrderPayload) {
    const { numberOfItems, itemWeight, value } = payload.orderInformation;
    const orderPrice = numberOfItems * itemWeight * value;
    return orderPrice;
  }
}
