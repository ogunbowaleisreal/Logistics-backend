import { Order } from "../../models/Order.Model";
import AppError from "../../utilities/ErrorHandler";

export class OrderService {
  public async getOrders(payload: any) {
    const { orderID, bankID, riderID, status, search, page, limit } = payload;

    if (orderID) {
      const order = await Order.findOne({ _id: orderID });
      if (!order) {
        throw new AppError(404, "Order not found");
      }
      return order;
    }

    const query: any = {};
    if(riderID) {

    }

    // if
  }
}
