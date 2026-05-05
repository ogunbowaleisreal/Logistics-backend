import { Order } from "../../models/Order.Model";
import { ShippingService } from "../business/Shipping.Services";
import AppError from "../../utilities/ErrorHandler";
import { IOrderPayload } from "../../utilities/Interfaces";
import ImageKit from "imagekit";
import { paginateModel } from "../../utilities/Pagination.Helper";
import { tenantScope } from "../../utilities/TenantScope";
import { resolveBusinessIdFromSlug } from "../../middlewares/authorization.middleware";
import { EmailService } from "../Email.Service";
import { ConfigurationService } from "../Configuration.Service";
import { SafeHaven } from "../../utilities/SafeHaven";
import { startSession } from "mongoose";
import { Business } from "../../models/Business.Model";

const emailService = new EmailService();
const shippingService = new ShippingService();
const configurationService = new ConfigurationService();
const safeHaven = new SafeHaven();

export class OrderService {
  public async createOrder(_businessId: string, payload: IOrderPayload) {
    const {
      slug,
      zoneId,
      distanceInKM,
      orderInformation,
      personnelInformation,
    } = payload;
    const businessId = await resolveBusinessIdFromSlug(slug);

    let calculatedShippingFee: number;
    if (distanceInKM) {
      calculatedShippingFee = await shippingService.calculateShippingFee(
        businessId,
        { distanceInKM },
      );
    } else if (zoneId) {
      calculatedShippingFee = await shippingService.calculateShippingFee(
        businessId,
        { zoneId },
      );
    } else {
      throw new AppError(400, "Either distanceInKM or zoneId must be provided");
    }

    const { amount, serviceFee, VAT, totalAmount } =
      await this.computeOrderFees({
        calculatedShippingFee,
      });

    const order = await Order.create({
      businessId,
      zoneId,
      distanceInKM,
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
      amount,
      serviceFee,
      VAT,
      totalAmount,
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

  public async checkoutOrder(
    businessId: string,
    payload: { orderID: string; paymentMethod: string },
  ) {
    const { orderID, paymentMethod } = payload;

    const order = await Order.findOne(
      tenantScope({ _id: orderID }, businessId),
    );
    if (!order) {
      throw new AppError(404, "Order not found");
    }

    if (order.status !== "pending") {
      throw new AppError(400, "Only pending orders can be checked out");
    }

    if (paymentMethod == "safehaven") {
      // const { accountNumber, accountName, expiryDate, callbackURL } =
      //   await safeHaven.createVirtualAccount({
      //     amount: order.totalAmount!,
      //     reference: order.id,
      //   });
      order.paymentMethod = "safehaven";
      order.virtualAccountData = {
        accountNumber: "0000000000",
        accountName: "Safehaven Virtual Account",
        bankName: "Safehaven Microfinance Bank",
        expiryDate: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
        callbackURL: "https://example.com/callback",
      };
    } else if (paymentMethod == "monnify") {
      // Implement Monnify payment processing logic here
    } else {
      throw new AppError(400, "Invalid payment method");
    }

    return await order.save();
  }

  public async verifySafehavenPaymentViaWebhook(orderID: string, payload: any) {
    const { type, data } = payload;
    if (type === "virtualAccount.transfer") {
      const { sessionId, externalReference } = data;
      if (externalReference != orderID) {
        throw new AppError(
          400,
          "Order ID in webhook does not match any existing order",
        );
      }
      const { status: verifiedStatus, amount: verifiedAmount } =
        await safeHaven.verifyPayment(sessionId);

      const session = await startSession();

      const order = await session.withTransaction(async () => {
        // Update transaction directly
        const updatedOrder = await Order.findOneAndUpdate(
          {
            _id: orderID,
            "virtualAccountData.accountNumber": data.destinationAccountNumber,
          },
          {
            status: verifiedStatus === "Completed" ? "paid" : "failed",
            totalAmount: verifiedAmount,
            "virtualAccountData.sessionId": sessionId,
          },
          { new: true, session },
        );

        if (!updatedOrder) {
          throw new AppError(
            404,
            "Order not found for the provided account number",
          );
        }

        if (verifiedStatus === "Completed") {
          const business = await Business.findOneAndUpdate(
            { _id: updatedOrder.businessId, isDeleted: false },
            { $inc: { "wallet.naira": updatedOrder.amount } },
            { session },
          );

          if (!business) {
            throw new AppError(404, "Account not found");
          }
        }

        return updatedOrder;
      });

      await session.endSession();

      if (order?.status === "paid") {
        // TODO: Send order confirmation email to customer
        // TODO: Send new order email to business
      }

      return order;
    }
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
      throw new AppError(400, "Order can only be canceled when pending");
    }

    if (order.personnelInformation.sender.phone !== phone) {
      throw new AppError(403, "Unauthorized: phone does not match order");
    }

    order.status = "canceled";
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

  private async computeOrderFees(payload: any) {
    const { calculatedShippingFee } = payload;
    const { serviceFee, VAT } = await configurationService.getConfiguration();
    if (serviceFee.type === "percentage") {
      payload.serviceFee = (serviceFee.value / 100) * calculatedShippingFee;
    } else {
      payload.serviceFee = serviceFee.value;
    }

    if (VAT.type === "percentage") {
      payload.VAT = (VAT.value / 100) * calculatedShippingFee;
    } else {
      payload.VAT = VAT.value;
    }

    return {
      amount: calculatedShippingFee - payload.serviceFee,
      serviceFee: payload.serviceFee,
      VAT: payload.VAT,
      totalAmount: calculatedShippingFee + payload.VAT,
    };
  }

  public async generateImageUploadSignature() {
    let imagekit = new ImageKit({
      publicKey: process.env["IMAGE_KIT_PUBLIC_KEY"]!,
      privateKey: process.env["IMAGE_KIT_PRIVATE_KEY"]!,
      urlEndpoint: process.env["IMAGE_KIT_URL_ENDPOINT"]!,
    });

    const signature = imagekit.getAuthenticationParameters();

    return signature;
  }
}
