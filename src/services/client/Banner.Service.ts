import { Banner } from "../../models/Banner.Model";
import AppError from "../../utilities/ErrorHandler";
import { tenantScope } from "../../utilities/TenantScope";

export class BannerService {
  public async getDefaultBanners(
    businessId: string,
    filter: { limit: string },
  ) {
    const { limit } = filter;
    const banner = await Banner.find(
      tenantScope({ isDefault: true }, businessId),
    ).limit(parseInt(limit || "5"));
    return banner;
  }
}
