import { Category } from "../../models/Category.Model";
import { Subcategory } from "../../models/Subcategory.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModel } from "../../utilities/Pagination.Helper";
import { capitalizeFirstLetter } from "../../utilities/StringConverter";
import { CategoryService } from "./Category.Service";

export class SubcategoryService {
  private categoryService: CategoryService;
  constructor(categoryService: CategoryService) {
    this.categoryService = categoryService;
  }

  public async createSubcategory(payload: any) {
    const { category } = payload;
    const validCategory = await this.categoryService.validateCategoryID(
      category
    );
    if (!validCategory) {
      throw new AppError(404, "Category not found");
    }
    payload.name = capitalizeFirstLetter(payload.name);
    await this.checkSubcategoryExistence(category, payload.name);

    const newSubCategory = await Subcategory.create(payload);
    validCategory.subcategories += 1;
    await validCategory.save();
    return newSubCategory;
  }

  public async getSubcategories(filter: any) {
    const { subcategoryID, category, search, status, page, limit } = filter;
    if (subcategoryID) {
      const subcategory = await Subcategory.findOne({
        _id: subcategoryID,
      });
      if (!subcategory) throw new AppError(404, "Subcategory not found");
      return subcategory;
    }
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (status) query.status = status;
    if (category) query.category = category;
    const subcategories = await paginateModel(Subcategory, query, page, limit, {
      createAt: -1,
    });
    return subcategories;
  }

  public async updateSubcategory(payload: any) {
    let { subcategoryID, name, description, status, category } = payload;
    const subcategory = await Subcategory.findOne({
      _id: subcategoryID,
      isDefault: false,
    });
    if (!subcategory) {
      throw new AppError(404, "Category not found");
    }
    name = name ? capitalizeFirstLetter(name) : undefined;
    if (name && subcategory.name !== name) {
      await this.checkSubcategoryExistence(
        subcategory.category as unknown as string,
        name
      );
      subcategory.name = name;
    }
    if (description) subcategory.description = description;
    if (status) subcategory.status = status;
    if (category) {
      const { category: oldCategory } = subcategory;
      const validCategory = await this.categoryService.validateCategoryID(
        category
      );
      if (!validCategory) {
        throw new AppError(404, "Category not found");
      }
      subcategory.category = validCategory.id;
      validCategory.subcategories += 1;
      await validCategory.save();
      await Category.updateOne(
        { _id: oldCategory },
        { $inc: { subcategories: -1 } }
      );
    }
    return await subcategory.save();
  }

  public async deleteSubcategory(subcategoryID: string) {
    const subcategory = await Subcategory.findOneAndUpdate(
      {
        _id: subcategoryID,
        isDefault: false,
      },
      { isDeleted: true }
    );
    if (!subcategory) {
      throw new AppError(404, "Subcategory not found");
    }

    const { category } = subcategory;
    await Category.updateOne(
      { _id: category },
      { $inc: { subcategories: -1 } }
    );
    // TODO: Move all product attached to default category
    return;
  }

  private async checkSubcategoryExistence(category: string, name: string) {
    const existingSubcategory = await Subcategory.findOne({ name, category });
    if (existingSubcategory)
      throw new AppError(409, "Subcategory already exists");
    return true;
  }

  public async validateSubcategoryID(subcategoryID: string) {
    const subcategory = await Subcategory.findOne({
      _id: subcategoryID,
    });
    if (!subcategory) throw new AppError(404, "Subcategory not found");
    return subcategory;
  }
}
