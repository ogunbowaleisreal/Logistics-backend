import { Theme } from "../../models/Themes.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModel } from "../../utilities/Pagination.Helper";

export class ThemeService {
  public async createTheme(payload: {
    font: string;
    color: string;
    status?: string;
  }) {
    const { font, color } = payload;
    const theme = await Theme.findOneAndUpdate(
      { font, color, isDeleted: false },
      payload,
      {
        new: true,
        upsert: true,
      }
    );
    return theme;
  }
  public async getThemes(filter: any) {
    const { themeID, page, limit } = filter;
    if (themeID) {
      const theme = await Theme.findOne({ _id: themeID, isDeleted: false });
      if (!theme) throw new AppError(404, "Theme not found");
      return theme;
    }
    const themes = await paginateModel(
      Theme,
      { isDeleted: false },
      page,
      limit
    );
    return themes;
  }

  public async updateTheme(payload: any) {
    const { themeID, ...rest } = payload;
    const theme = await Theme.findOneAndUpdate(
      { _id: themeID, isDeleted: false },
      rest,
      { new: true }
    );
    if (!theme) throw new AppError(404, "Theme not found");
    return theme;
  }

  public async deleteTheme(themeID: string) {
    const theme = await Theme.findOneAndUpdate(
      { _id: themeID, isDeleted: false },
      { isDeleted: true }
    );
    if (!theme) throw new AppError(404, "Theme not found");
    return theme;
  }
}
