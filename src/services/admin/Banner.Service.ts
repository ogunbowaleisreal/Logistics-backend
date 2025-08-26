import { Banner } from "../../models/Banner.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModel } from "../../utilities/Pagination.Helper";

export class BannerService {
  public async createBanner(payload: any) {
    const banner = await Banner.create(payload);
    return banner;
  }
  public async getBanners(payload: any) {
    const { bannerID, search, isDefault, status, page, limit } = payload;
    if (bannerID) {
      const banner = await Banner.findOne({ _id: bannerID });
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
    const banners = await paginateModel(Banner, query, page, limit);
    return banners;
  }

  public async updateBanner(payload: any) {
    const { bannerID, text, image, link, status } = payload;
    const banner = await Banner.findOneAndUpdate(
      { _id: bannerID },
      { text, image, link, status },
      {
        new: true,
      }
    );
    if (!banner) {
      throw new AppError(404, "Banner not found");
    }
    return banner;
  }

  public async setDefaultBanner(bannerID: string) {
    const banner = await Banner.findOneAndUpdate(
      { _id: bannerID },
      { isDefault: true },
      {
        new: true,
      }
    );
    if (!banner) {
      throw new AppError(404, "Banner not found");
    }

    return banner;
  }

  public async deleteBanner(bannerID: string) {
    const banner = await Banner.findOneAndDelete({ _id: bannerID });

    if (!banner) {
      throw new AppError(404, "Banner not found");
    }

    return;
  }
}
