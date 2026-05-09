import { Rider } from "../../models/Rider.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModel } from "../../utilities/Pagination.Helper";
import { tenantScope } from "../../utilities/TenantScope";

export class RiderService {
  public async createRider(businessId: string, payload: any) {
    const { name, phone, dailyCapacity, rideType } = payload;

    const rider = await Rider.create({
      businessId,
      name,
      phone,
      dailyCapacity,
      rideType,
    });

    return rider;
  }

  public async getRiders(businessId: string, filter: any) {
    const { riderID, search, status, page, limit } = filter;

    if (riderID) {
      const rider = await Rider.findOne(
        tenantScope({ _id: riderID, isDeleted: false }, businessId),
      );
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

    const riders = await paginateModel(
      Rider,
      tenantScope(query, businessId),
      page,
      limit,
    );
    return riders;
  }

  public async updateRider(businessId: string, payload: any) {
    const { riderID, name, phone, dailyCapacity, status, rideType } = payload;

    const rider = await Rider.findOne(
      tenantScope({ _id: riderID, isDeleted: false }, businessId),
    );
    if (!rider) {
      throw new AppError(404, "Rider not found");
    }

    if (name) rider.name = name;
    if (phone) rider.phone = phone;
    if (dailyCapacity) rider.dailyCapacity = dailyCapacity;
    if (status) rider.status = status;
    if (rideType) rider.rideType = rideType;

    return await rider.save();
  }

  public async deleteRider(businessId: string, riderID: string) {
    const rider = await Rider.findOneAndUpdate(
      tenantScope({ _id: riderID, isDeleted: false }, businessId),
      { isDeleted: true },
    );
    if (!rider) {
      throw new AppError(404, "Rider not found");
    }

    return;
  }
}
