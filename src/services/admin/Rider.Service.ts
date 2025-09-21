import { Rider } from "../../models/Rider.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModel } from "../../utilities/Pagination.Helper";

export class RiderService {
  public async createRider(payload: any) {
    const { name, phone, dailyCapacity } = payload;

    const rider = await Rider.create({
      name,
      phone,
      dailyCapacity,
    });

    return rider;
  }

  public async getRiders(filter: any) {
    const { riderID, search, status, page, limit } = filter;

    if (riderID) {
      const rider = await Rider.findOne({ _id: riderID, isDeleted: false });
      if (!rider) {
        throw new AppError(404, "Rider not found");
      }
      return rider;
    }

    const query: any = { isDeleted: false };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    const riders = await paginateModel(Rider, query, page, limit);
    return riders;
  }

  public async updateRider(payload: any) {
    const { riderID, name, phone, dailyCapacity, status } = payload;

    const rider = await Rider.findOne({ _id: riderID, isDeleted: false });
    if (!rider) {
      throw new AppError(404, "Rider not found");
    }

    if (name) rider.name = name;
    if (phone) rider.phone = phone;
    if (dailyCapacity) rider.dailyCapacity = dailyCapacity;
    if (status) rider.status = status;

    return await rider.save();
  }

  public async deleteRider(riderID: string) {
    const rider = await Rider.findOneAndUpdate(
      { _id: riderID, isDeleted: false },
      { isDeleted: true }
    );
    if (!rider) {
      throw new AppError(404, "Rider not found");
    }

    return;
  }
}
