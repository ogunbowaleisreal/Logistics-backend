import { Subcategory } from "../../models/Subcategory.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModel } from "../../utilities/Pagination.Helper";

export class SubcategoryService {
  public async getSubcategories(filter: any) {
    const { subcategoryID, categoryID, search, page, limit } = filter;
    if (subcategoryID) {
      const subcategory = await Subcategory.findOne({
        _id: subcategoryID,
        isDeleted: false,
      });
      if (!subcategory) throw new AppError(404, "Subcategory not found");
      return subcategory;
    }
    const query: any = { isDeleted: false };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (categoryID) query.category = categoryID;
    const subcategories = await paginateModel(Subcategory, query, page, limit, {
      createAt: -1,
    });
    return subcategories;
  }
}
