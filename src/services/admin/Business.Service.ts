import { Business } from "../../models/Business.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModel } from "../../utilities/Pagination.Helper";

export class BusinessService {
  public async getBusinesses(filter: any) {
    const { businessId, search, status, plan, page, limit } = filter;

    if (businessId) {
      const business = await Business.findOne({
        _id: businessId,
        isDeleted: false,
      });
      if (!business) {
        throw new AppError(404, "Business not found");
      }
      return business;
    }

    const query: any = { isDeleted: false };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (plan) {
      query.plan = plan;
    }

    return paginateModel(Business, query, page, limit);
  }

  public async updateBusinessStatus(
    businessId: string,
    status: "active" | "suspended",
  ) {
    const business = await Business.findOne({
      _id: businessId,
      isDeleted: false,
    });

    if (!business) {
      throw new AppError(404, "Business not found");
    }

    if (business.status === status) {
      throw new AppError(400, `Business already ${status}`);
    }

    business.status = status;
    await business.save();

    return business;
  }

  public async deleteBusiness(businessId: string) {
    const business = await Business.findOneAndUpdate(
      { _id: businessId, isDeleted: false },
      { isDeleted: true },
    );

    if (!business) {
      throw new AppError(404, "Business not found");
    }

    return;
  }
}
