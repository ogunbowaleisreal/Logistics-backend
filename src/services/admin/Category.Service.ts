import { Category } from "../../models/Category.Model";
import { Subcategory } from "../../models/Subcategory.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModel } from "../../utilities/Pagination.Helper";
import { capitalizeFirstLetter } from "../../utilities/StringConverter";

export class CategoryService {
  public async createCategory(payload: any) {
    payload.name = capitalizeFirstLetter(payload.name);
    await this.checkCategoryExistence(payload.name);

    const newCategory = await Category.create(payload);
    await this.createDefaultSubCategory("Uncategorized", newCategory.id);

    return newCategory;
  }

  public async createDefaultCategory(payload: any) {
    payload.name = capitalizeFirstLetter(payload.name);
    payload.isDefault = true;
    await this.checkCategoryExistence(payload.name);

    const newCategory = await Category.create(payload);
    await this.createDefaultSubCategory("Uncategorized", newCategory.id);

    return newCategory;
  }

  public async getCategories(filter: any) {
    const { categoryID, search, status, page, limit } = filter;
    if (categoryID) {
      const category = await Category.findOne({
        _id: categoryID,
      });
      if (!category) throw new AppError(404, "Category not found");
      return category;
    }
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (status) query.status = status;
    const categories = await paginateModel(Category, query, page, limit, {
      createAt: -1,
    });
    return categories;
  }

  public async updateCategory(payload: any) {
    let { categoryID, name, description, status, color } = payload;
    const category = await Category.findOne({
      _id: categoryID,
      isDefault: false,
    });
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

  public async deleteCategory(categoryID: string) {
    const category = await Category.findOneAndUpdate(
      {
        _id: categoryID,
        isDefault: false,
        isDeleted: false,
      },
      { isDeleted: true }
    );
    if (!category) {
      throw new AppError(404, "Category not found");
    }

    // TOD: Move all product attached to default category
    return;
  }

  private async checkCategoryExistence(name: string) {
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) throw new AppError(409, "Category already exists");
    return true;
  }

  public async validateCategoryID(categoryID: string) {
    const category = await Category.findOne({
      _id: categoryID,
    });
    if (!category) throw new AppError(404, "Category not found");
    return category;
  }

  private async createDefaultSubCategory(name: string, category: string) {
    const subCategory = await Subcategory.create({
      category,
      name,
    });
    return;
  }
}
