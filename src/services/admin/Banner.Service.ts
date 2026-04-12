import { Banner } from "../../models/Banner.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModel } from "../../utilities/Pagination.Helper";
import { tenantScope } from "../../utilities/TenantScope";

export class BannerService {
  public async createBanner(businessId: string, payload: any) {
    const banner = await Banner.create({ ...payload, businessId });
    return banner;
  }
  public async getBanners(businessId: string, payload: any) {
    const { bannerID, search, isDefault, status, page, limit } = payload;
    if (bannerID) {
      const banner = await Banner.findOne(
        tenantScope({ _id: bannerID }, businessId),
      );
      if (!banner) {
        throw new AppError(404, "Banner not found");
      }
      return banner;
    }
    const query: any = {};
    if (search) {
      query.$or = [
        { text: { $regex: search, $options: "i" } },
        { link: { $regex: search, $options: "i" } },
      ];
    }
    if (status) {
      query.status = status;
    }
    if (isDefault === "true" || isDefault === "false") {
      query.isDefault = isDefault === "true" ? true : false;
    }
    const banners = await paginateModel(
      Banner,
      tenantScope(query, businessId),
      page,
      limit,
    );
    return banners;
  }

  public async updateBanner(businessId: string, payload: any) {
    const { bannerID, text, image, link, status } = payload;
    const banner = await Banner.findOneAndUpdate(
      tenantScope({ _id: bannerID }, businessId),
      { text, image, link, status },
      {
        new: true,
      },
    );
    if (!banner) {
      throw new AppError(404, "Banner not found");
    }
    return banner;
  }

  public async setDefaultBanner(businessId: string, bannerID: string) {
    await Banner.updateMany(tenantScope({ isDefault: true }, businessId), {
      isDefault: false,
    });
    const banner = await Banner.findOneAndUpdate(
      tenantScope({ _id: bannerID }, businessId),
      { isDefault: true },
      {
        new: true,
      },
    );
    if (!banner) {
      throw new AppError(404, "Banner not found");
    }

    return banner;
  }

  public async deleteBanner(businessId: string, bannerID: string) {
    const banner = await Banner.findOneAndDelete(
      tenantScope({ _id: bannerID }, businessId),
    );

    if (!banner) {
      throw new AppError(404, "Banner not found");
    }

    return;
  }
}
