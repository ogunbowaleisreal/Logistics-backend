import { Order } from "../../models/Order.Model";
import { ShippingService } from "../business/Shipping.Services";
import { BusinessConfiguration } from "../../models/BusinessConfiguration.Model";
import AppError from "../../utilities/ErrorHandler";
import { IOrderPayload } from "../../utilities/Interfaces";
import ImageKit from "imagekit";
import { paginateModel } from "../../utilities/Pagination.Helper";
import { tenantScope } from "../../utilities/TenantScope";
import { resolveBusinessIdFromSlug } from "../../middlewares/authorization.middleware";
import { EmailService } from "../Email.Service";
import { ConfigurationService } from "../Configuration.Service";
import { SafeHaven } from "../../utilities/SafeHaven";
import { Monnify } from "../../utilities/Monnify";
import { Flutterwave } from "../../utilities/Flutterwave";
import { startSession } from "mongoose";
import { Business } from "../../models/Business.Model";
import { riderAssignmentService } from "../RiderAssignment.Service";

const emailService = new EmailService();
const shippingService = new ShippingService();
const configurationService = new ConfigurationService();
const safeHaven = new SafeHaven();
const monnify = new Monnify();
const flutterwave = new Flutterwave();

function normalizeRegions(val: string | string[] | undefined): string[] {
  if (!val) return ["local"];
  return Array.isArray(val) ? val : [val];
}

export class OrderService {
  public async createOrder(_businessId: string, payload: IOrderPayload) {
    const {
      slug,
      zoneId,
      distanceInKM,
      rideType,
      shippingType = "local",
      originState,
      orderInformation,
      personnelInformation,
    } = payload;
    const businessId = await resolveBusinessIdFromSlug(slug);

    const config = await BusinessConfiguration.findOne(
      { businessId },
      { shippingRegion: 1 },
    ).lean();

    const regions = normalizeRegions(config?.shippingRegion);

    if (shippingType === "inter-state" && !regions.includes("inter-state")) {
      throw new AppError(
        400,
        "Inter-state shipping is not enabled for this business",
      );
    }
    if (
      shippingType === "international" &&
      !regions.includes("international")
    ) {
      throw new AppError(
        400,
        "International shipping is not enabled for this business",
      );
    }

    if (!rideType) {
      throw new AppError(400, "rideType is required");
    }

    const calculatedShippingFee = await shippingService.calculateFee(
      businessId,
      {
        shippingType,
        rideType,
        zoneId,
        distanceInKM,
        weightKg: orderInformation.itemWeight,
        originState,
        destinationState: orderInformation.dropoffLocation.state,
        country: orderInformation.dropoffLocation.country,
        city: orderInformation.dropoffLocation.city,
      },
    );

    const { amount, serviceFee, VAT, totalAmount } =
      await this.computeOrderFees({
        calculatedShippingFee,
      });

    const order = await Order.create({
      businessId,
      zoneId,
      distanceInKM,
      rideType,
      shippingType,
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

    if (process.env["NODE_ENV"] === "development") {
      const session = await startSession();
      await session.withTransaction(async () => {
        await Order.findOneAndUpdate(
          { _id: order._id },
          { status: "paid" },
          { session },
        );
        await Business.findOneAndUpdate(
          { _id: order.businessId, isDeleted: false },
          { $inc: { "wallet.naira": order.amount } },
          { session },
        );
      });
      await session.endSession();
      order.status = "paid";
    } else {
      const { accountNumber, accountName, expiryDate, callbackURL } =
        await safeHaven.createVirtualAccount({
          amount: order.totalAmount!,
          reference: order.id,
        });
      order.paymentMethod = "safehaven";
      order.virtualAccountData = {
        accountNumber,
        accountName,
        bankName: "Safehaven Microfinance Bank",
        expiryDate,
        callbackURL,
      };
    }

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
    payload: { orderID: string; paymentMethod: string; slug: string },
  ) {
    const { orderID, paymentMethod, slug } = payload;

    const [order, config] = await Promise.all([
      Order.findOne(tenantScope({ _id: orderID }, businessId)),
      configurationService.getConfiguration(),
    ]);

    if (!order) {
      throw new AppError(404, "Order not found");
    }

    if (order.status !== "pending") {
      throw new AppError(400, "Only pending orders can be checked out");
    }

    const enabledGateways = config.paymentMethods
      .filter((m) => m.isEnabled)
      .map((m) => m.gateway);
    if (!enabledGateways.includes(paymentMethod as any)) {
      throw new AppError(400, "Selected payment method is not available");
    }

    if (paymentMethod == "safehaven") {
    } else if (paymentMethod == "monnify") {
      const senderEmail = order.personnelInformation.sender.email;
      if (!senderEmail) {
        throw new AppError(400, "Sender email is required for Monnify payment");
      }

      const { checkoutUrl, transactionReference } =
        await monnify.initiatePayment({
          email: senderEmail,
          amount: order.totalAmount,
          reference: String(order._id),
          customerName: order.personnelInformation.sender.name,
        });

      order.paymentMethod = "monnify";
      order.virtualAccountData = {
        sessionId: transactionReference,
        callbackURL: checkoutUrl,
      };
    } else if (paymentMethod == "flutterwave") {
      const senderEmail = order.personnelInformation.sender.email;
      if (!senderEmail) {
        throw new AppError(
          400,
          "Sender email is required for Flutterwave payment",
        );
      }

      const { paymentUrl, reference, expiresAt } =
        await flutterwave.initiateCardPayment({
          txRef: String(order._id),
          amount: order.totalAmount,
          redirectUrl: `${process.env.FLUTTERWAVE_REDIRECT_URL}/${slug}/payment?orderId=${order._id}`,
          customerEmail: senderEmail,
          customerName: order.personnelInformation.sender.name,
          customerPhone: order.personnelInformation.sender.phone,
        });

      order.paymentMethod = "flutterwave";
      order.virtualAccountData = {
        sessionId: reference,
        callbackURL: paymentUrl,
        expiryDate: expiresAt,
      };
    } else {
      throw new AppError(400, "Invalid payment method");
    }

    return await order.save();
  }

  public async verifyMonnifyPaymentViaWebhook(payload: any, signature: string) {
    const rawBody = JSON.stringify(payload);
    if (!monnify.verifyWebhookSignature(rawBody, signature)) {
      throw new AppError(400, "Invalid Monnify webhook signature");
    }

    const { eventType, eventData } = payload;

    if (eventType !== "SUCCESSFUL_TRANSACTION") {
      return;
    }

    const {
      transactionReference,
      paymentReference,
      amountPaid,
      paymentStatus,
    } = eventData;

    const session = await startSession();

    const order = await session.withTransaction(async () => {
      const updatedOrder = await Order.findOneAndUpdate(
        {
          _id: paymentReference,
          "virtualAccountData.sessionId": transactionReference,
        },
        {
          status: paymentStatus === "PAID" ? "paid" : "failed",
          totalAmount: amountPaid,
        },
        { new: true, session },
      );

      if (!updatedOrder) {
        throw new AppError(404, "Order not found for the provided reference");
      }

      if (paymentStatus === "PAID") {
        const business = await Business.findOneAndUpdate(
          { _id: updatedOrder.businessId, isDeleted: false },
          { $inc: { "wallet.naira": updatedOrder.amount } },
          { session },
        );

        if (!business) {
          throw new AppError(404, "Account not found");
        }

        // await riderAssignmentService.assignRider(
        //   updatedOrder.businessId.toString(),
        //   updatedOrder,
        //   session,
        // );
      }

      return updatedOrder;
    });

    await session.endSession();

    return order;
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

          // await riderAssignmentService.assignRider(
          //   updatedOrder.businessId.toString(),
          //   updatedOrder,
          //   session,
          // );
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

  public async verifyFlutterwavePaymentViaWebhook(payload: any) {
    const { event, data } = payload;

    if (event !== "charge.completed") {
      throw new AppError(400, "Invalid Flutterwave event type");
    }

    const { tx_ref, status, amount } = data;
    const isSuccessful = status === "successful";

    const session = await startSession();

    const order = await session.withTransaction(async () => {
      const updatedOrder = await Order.findOneAndUpdate(
        {
          _id: tx_ref,
          "virtualAccountData.sessionId": tx_ref,
          status: { $ne: "paid" },
        },
        {
          status: isSuccessful ? "paid" : "failed",
          totalAmount: amount,
        },
        { new: true, session },
      );

      if (!updatedOrder) {
        return null;
      }

      if (isSuccessful) {
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

    return order;
  }

  public async trackOrder(businessId: string, trackingID: string) {
    const validateTrackingID = trackingID.startsWith("SME-");
    if (!validateTrackingID) {
      trackingID = `SME-${trackingID}`;
    }
    const order = await Order.findOne({
      ...tenantScope({}, businessId),
      trackingID: trackingID.toUpperCase(),
    }).populate([
      { path: "businessId", select: "name slug logo socialLinks supports" },
      { path: "riderID", select: "name phone rideType" },
    ]);
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

    const matchedTier = serviceFee.tiers.find(
      (tier) =>
        calculatedShippingFee >= tier.minAmount &&
        (tier.maxAmount === null || calculatedShippingFee <= tier.maxAmount),
    );
    const rawFee = matchedTier
      ? (matchedTier.percentage / 100) * calculatedShippingFee
      : 0;
    payload.serviceFee = Math.min(rawFee, serviceFee.cap);

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
