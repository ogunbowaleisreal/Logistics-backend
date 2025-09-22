import { Order } from "../../models/Order.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModelWithMultiplePopulates } from "../../utilities/Pagination.Helper";

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
    if (riderID) {
      query.riderID = riderID;
    }
    if (status) {
      query.status = status;
    }
    if (bankID) {
      query.bankID = bankID;
    }

    const orders = await paginateModelWithMultiplePopulates(
      Order,
      query,
      page,
      limit,
      [
        {
          path: "riderID",
          select: "name phone",
        },
        {
          path: "bankID",
          select: "name accountName accountNumber",
        },
      ]
    );

    return orders;
  }

  public async updateOrderStatus(payload: any) {
    const { orderID, status } = payload;
    const order = await Order.findOneAndUpdate(
      { _id: orderID },
      { status },
      { new: true }
    );

    return order;
  }
}
