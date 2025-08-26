import { Category } from "../../models/Category.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModel } from "../../utilities/Pagination.Helper";
import { capitalizeFirstLetter } from "../../utilities/StringConverter";

export class CategoryService {
  public async createCategory(payload: any) {
    payload.name = capitalizeFirstLetter(payload.name);
    await this.checkCategoryExistence(payload.name);
    return await Category.create(payload);
  }

  public async getCategories(filter: any) {
    const { categoryID, search, page, limit } = filter;
    if (categoryID) {
      const category = await Category.findOne({
        _id: categoryID,
        isDeleted: false,
        status: "active",
      });
      if (!category) throw new AppError(404, "Category not found");
      return category;
    }
    const query: any = { isDeleted: false, status: "active" };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const categories = await paginateModel(Category, query, page, limit, {
      createAt: -1,
    });
    return categories;
  }

  public async updateCategory(payload: any) {
    let { categoryID, name, description, status, color } = payload;
    const category = await Category.findById(categoryID);
    if (!category) {
      throw new AppError(404, "Category not found");
    }
    name = name ? capitalizeFirstLetter(name) : undefined;
    if (name && category.name !== name) {
      await this.checkCategoryExistence(name);
      category.name = name;
    }
    if (description) category.description = description;
    if (status) category.status = status;
    return await category.save();
  }

  private async checkCategoryExistence(name: string) {
    const existingCategory = await Category.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });
    if (existingCategory) throw new AppError(409, "Category already exists");
    return true;
  }

  public async validateCategoryID(categoryID: string) {
    const category = await Category.findById(categoryID);
    if (!category) throw new AppError(404, "Category not found");
    return category;
  }
}
