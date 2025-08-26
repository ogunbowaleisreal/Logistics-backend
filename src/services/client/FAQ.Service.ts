import { FAQ, FAQCategory } from "../../models/FAQ.Model";
import AppError from "../../utilities/ErrorHandler";
import {
  paginateModel,
  paginateModelWithPopulate,
} from "../../utilities/Pagination.Helper";

export class FAQService {
  public async getFAQCategories(filter: any) {
    const { categoryID, search, page, limit } = filter;
    if (categoryID) {
      const category = await FAQCategory.findOne({
        _id: categoryID,
        status: "active",
      });
      if (!category) {
        throw new AppError(404, "FAQ category not found");
      }
      return;
    }
    let query: any = { status: "active" };
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const faqCategories = await paginateModel(FAQCategory, query, page, limit);
    return faqCategories;
  }
  public async getFAQs(filter: any) {
    const { faqID, categoryID, search, page, limit } = filter;
    if (faqID) {
      const faq = await FAQ.findOne({ _id: faqID }).populate({
        path: "category",
        select: "name",
      });
      if (!faq) {
        throw new AppError(404, "FAQ not found");
      }
      return faq;
    }
    let query: any = {};
    if (categoryID) {
      query.category = categoryID;
    }
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: "i" } },
        { answer: { $regex: search, $options: "i" } },
      ];
    }

    const faqs = await paginateModelWithPopulate(
      FAQ,
      query,
      page,
      limit,
      { createdAt: -1 },
      { path: "category", select: "name" }
    );
    return faqs;
  }
}
