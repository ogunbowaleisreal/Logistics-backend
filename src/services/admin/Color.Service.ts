import { Color } from "../../models/Color.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModel } from "../../utilities/Pagination.Helper";

export class ColorService {
  public async createColor(payload: { name: string; hex?: string }) {
    let { name } = payload;
    payload.name = name.toLowerCase().trim();
    const existingColor = await this.validateColorExistence(payload.name);
    if (existingColor) {
      throw new AppError(429, "Color already exists");
    }
    const color = await Color.create(payload);
    return color;
  }

  public async getColors(filter: {
    search?: string;
    status?: string;
    page: string;
    limit: string;
  }) {
    const { search, status, page, limit } = filter;
    const query: any = { isDeleted: false };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { hex: { $regex: search, $options: "i" } },
      ];
    }
    if (status) {
      query.status = status;
    }
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;

    const colors = await paginateModel(Color, query, pageNumber, limitNumber, {
      createdAt: -1,
    });
    return colors;
  }

  public async updateColor(payload: {
    colorID: string;
    name: string;
    hex: string;
    status: string;
  }) {
    let { colorID, name, hex, status } = payload;
    const color = await Color.findOne({ _id: colorID, isDeleted: false });
    if (!color) {
      throw new AppError(404, "Color not found");
    }
    const { name: existingName } = color;
    if (name && existingName.toLowerCase() != name.toLowerCase().trim()) {
      const validateColorExistence = await this.validateColorExistence(name);
      if (validateColorExistence) {
        throw new AppError(400, "Color with this name already exists");
      }
      name = name.toLowerCase().trim();
    }

    if (hex) {
      hex = hex.toLowerCase().trim();
    }
    const updatedColor = await Color.findOneAndUpdate(
      { _id: colorID, isDeleted: false },
      { name, hex, status },
      { new: true }
    );
    return updatedColor;
  }

  public async deleteColor(colorID: string) {
    const color = await Color.findOneAndUpdate(
      { _id: colorID, isDeleted: false },
      { isDeleted: true },
      { new: true }
    );
    if (!color) {
      throw new AppError(404, "Color not found");
    }
    return;
  }

  private async validateColorExistence(name: string) {
    const existingColor = await Color.findOne({ name, isDeleted: false });
    return existingColor;
  }
}
