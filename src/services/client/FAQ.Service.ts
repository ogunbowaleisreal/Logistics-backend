import { FAQ, FAQCategory } from "../../models/FAQ.Model";
import AppError from "../../utilities/ErrorHandler";
import {
  paginateModel,
  paginateModelWithPopulate,
} from "../../utilities/Pagination.Helper";
import { tenantScope } from "../../utilities/TenantScope";

export class FAQService {
  public async getFAQCategories(businessId: string, filter: any) {
    const { categoryID, search, page, limit } = filter;
    if (categoryID) {
      const category = await FAQCategory.findOne({
        ...tenantScope({ _id: categoryID }, businessId),
        status: "active",
      });
      if (!category) {
        throw new AppError(404, "FAQ category not found");
      }
      return category;
    }
    let query: any = tenantScope({ status: "active" }, businessId);
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const faqCategories = await paginateModel(FAQCategory, query, page, limit);
    return faqCategories;
  }
  public async getFAQs(businessId: string, filter: any) {
    const { faqID, categoryID, search, page, limit } = filter;
    if (faqID) {
      const faq = await FAQ.findOne(
        tenantScope({ _id: faqID }, businessId),
      ).populate({
        path: "category",
        select: "name",
      });
      if (!faq) {
        throw new AppError(404, "FAQ not found");
      }
      return faq;
    }
    let query: any = tenantScope({}, businessId);
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
      { path: "category", select: "name" },
    );
    return faqs;
  }
}
