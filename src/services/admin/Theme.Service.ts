import { Theme } from "../../models/Themes.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModel } from "../../utilities/Pagination.Helper";
import { tenantScope } from "../../utilities/TenantScope";

export class ThemeService {
  public async createTheme(
    businessId: string,
    payload: {
      font: string;
      color: string;
      logo?: string;
      status?: string;
    },
  ) {
    const { font, color } = payload;
    const theme = await Theme.findOneAndUpdate(
      tenantScope({ font, color, isDeleted: false }, businessId),
      { ...payload, businessId },
      {
        new: true,
        upsert: true,
      },
    );
    return theme;
  }
  public async getThemes(businessId: string, filter: any) {
    const { themeID, page, limit } = filter;
    if (themeID) {
      const theme = await Theme.findOne(
        tenantScope({ _id: themeID, isDeleted: false }, businessId),
      );
      if (!theme) throw new AppError(404, "Theme not found");
      return theme;
    }
    const themes = await paginateModel(
      Theme,
      tenantScope({ isDeleted: false }, businessId),
      page,
      limit,
    );
    return themes;
  }

  public async updateTheme(businessId: string, payload: any) {
    const { themeID, ...rest } = payload;
    const theme = await Theme.findOneAndUpdate(
      tenantScope({ _id: themeID, isDeleted: false }, businessId),
      rest,
      { new: true },
    );
    if (!theme) throw new AppError(404, "Theme not found");
    return theme;
  }

  public async deleteTheme(businessId: string, themeID: string) {
    const theme = await Theme.findOneAndUpdate(
      tenantScope({ _id: themeID, isDeleted: false }, businessId),
      { isDeleted: true },
    );
    if (!theme) throw new AppError(404, "Theme not found");
    return theme;
  }
}
