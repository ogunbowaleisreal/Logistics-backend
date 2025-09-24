import { Order } from "../../models/Order.Model";
import AppError from "../../utilities/ErrorHandler";
import { IOrderPayload } from "../../utilities/Interfaces";
import ImageKit from "imagekit";

export class OrderService {
  public async createOrder(payload: IOrderPayload) {
    const {
      pickupLocation,
      dropoffLocation,
      items,
      numberOfItems,
      itemWeight,
      value,
      personnelInformation,
    } = payload;

    const order = await Order.create({
      orderInformation: {
        pickupLocation,
        dropoffLocation,
        items,
        numberOfItems,
        itemWeight,
        value,
      },
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
      amount: await this.computeOrderPrice(payload),
    });

    return order;
  }

  public async getOrderSummary(orderID: string) {
    const order = await Order.findOne({ _id: orderID });
    if (!order) {
      throw new AppError(404, "Order not found");
    }
    return order;
  }

  public async provideProofOfPayment(payload: {
    orderID: string;
    bankID: string;
    proofOfPayment: string;
  }) {
    const { orderID, bankID, proofOfPayment } = payload;

    const order = await Order.findOneAndUpdate(
      { _id: orderID },
      { proofOfPayment, bankID },
      { new: true }
    );
    if (!order) {
      throw new AppError(404, "Order not found");
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

  public async trackOrder(trackingID: string) {
    const validateTrackingID = trackingID.startsWith("SME-");
    if (!validateTrackingID) {
      trackingID = `SME-${trackingID}`;
    }
    const order = await Order.findOne({
      trackingID: trackingID.toUpperCase(),
    });
    if (!order) {
      throw new AppError(404, "Order not found");
    }
    return order;
  }

  public async computeOrderPrice(payload: IOrderPayload) {
    const { numberOfItems, itemWeight, value } = payload;
    const orderPrice = numberOfItems * itemWeight * value;
    return orderPrice;
  }
}
