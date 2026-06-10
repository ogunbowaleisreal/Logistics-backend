import { Rider } from "../../models/Rider.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModel } from "../../utilities/Pagination.Helper";
import { tenantScope } from "../../utilities/TenantScope";

export class RiderService {
  public async getRiders(filter: any) {
    const { businessId, riderID, search, status, page, limit } = filter;

    if (riderID) {
      const baseQuery = { _id: riderID, isDeleted: false };
      const rider = await Rider.findOne(
        businessId ? tenantScope(baseQuery, businessId) : baseQuery,
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
      businessId ? tenantScope(query, businessId) : query,
      page,
      limit,
    );
    return riders;
  }

  // public async updateRider(businessId: string, payload: any) {
  //   const { riderID, name, phone, dailyCapacity, status } = payload;

  //   const rider = await Rider.findOne(
  //     tenantScope({ _id: riderID, isDeleted: false }, businessId),
  //   );
  //   if (!rider) {
  //     throw new AppError(404, "Rider not found");
  //   }

  //   if (name) rider.name = name;
  //   if (phone) rider.phone = phone;
  //   if (dailyCapacity) rider.dailyCapacity = dailyCapacity;
  //   if (status) rider.status = status;

  //   return await rider.save();
  // }

  // public async deleteRider(businessId: string, riderID: string) {
  //   const rider = await Rider.findOneAndUpdate(
  //     tenantScope({ _id: riderID, isDeleted: false }, businessId),
  //     { isDeleted: true },
  //   );
  //   if (!rider) {
  //     throw new AppError(404, "Rider not found");
  //   }

  //   return;
  // }
}
