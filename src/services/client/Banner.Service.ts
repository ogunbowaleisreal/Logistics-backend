import { Banner } from "../../models/Banner.Model";
import AppError from "../../utilities/ErrorHandler";

export class BannerService {
  public async getDefaultBanners(filter: { limit: string }) {
    const { limit } = filter;
    const banner = await Banner.find({ isDefault: true }).limit(
      parseInt(limit || "5")
    );
    return banner;
  }
}
