import { Order } from "../../models/Order.Model";
import AppError from "../../utilities/ErrorHandler";
import { IOrderPayload } from "../../utilities/Interfaces";
import { v4 as uuidv4 } from "uuid";

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

  public async trackOrder(trackingID: string) {
    console.log(trackingID);
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
