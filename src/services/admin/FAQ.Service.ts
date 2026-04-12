import { FAQ, FAQCategory } from "../../models/FAQ.Model";
import AppError from "../../utilities/ErrorHandler";
import {
  paginateModel,
  paginateModelWithPopulate,
} from "../../utilities/Pagination.Helper";
import { tenantScope } from "../../utilities/TenantScope";

export class FAQCategoryService {
  public async createFAQCategory(businessId: string, payload: any) {
    const faqCategory = await FAQCategory.create({ ...payload, businessId });
    return faqCategory;
  }

  public async getFAQCategories(businessId: string, filter: any) {
    const { categoryID, status, search, page, limit } = filter;
    if (categoryID) {
      const category = await FAQCategory.findOne(
        tenantScope({ _id: categoryID }, businessId),
      );
      if (!category) {
        throw new AppError(404, "FAQ category not found");
      }
      return category;
    }
    let query: any = {};
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }];
    }

    const faqCategories = await paginateModel(
      FAQCategory,
      tenantScope(query, businessId),
      page,
      limit,
    );
    return faqCategories;
  }

  public async updateFAQCategory(businessId: string, payload: any) {
    const { categoryID, ...rest } = payload;

    const faqCategory = await FAQCategory.findOneAndUpdate(
      tenantScope({ _id: categoryID }, businessId),
      rest,
      {
        new: true,
      },
    );
    if (!faqCategory) {
      throw new AppError(404, "FAQ category not found");
    }
    return faqCategory;
  }
}

export class FAQService {
  public async createFAQ(businessId: string, payload: any) {
    const category = await this.validateFAQCategory(
      businessId,
      payload.categoryID,
    );
    if (!category) {
      throw new AppError(404, "FAQ category not found");
    }
    payload.category = payload.categoryID;
    const faq = await FAQ.create({ ...payload, businessId });
    return faq;
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
    const query: any = {};
    if (categoryID) {
      query.category = categoryID;
    }
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: "i" } },
        { answer: { $regex: search, $options: "i" } },
      ];
    }
    const scopedQuery = tenantScope(query, businessId);
    const faqs = await paginateModelWithPopulate(
      FAQ,
      scopedQuery,
      page,
      limit,
      { createdAt: -1 },
      { path: "category", select: "name" },
    );
    return faqs;
  }

  public async updateFAQ(businessId: string, payload: any) {
    const { faqID, categoryID, question, answer } = payload;
    const faq = await FAQ.findOneAndUpdate(
      tenantScope({ _id: faqID }, businessId),
    );
    if (!faq) {
      throw new AppError(404, "FAQ not found");
    }
    if (categoryID) {
      const existingCategory = await this.validateFAQCategory(
        businessId,
        categoryID,
      );
      if (!existingCategory) {
        throw new AppError(404, "FAQ category not found");
      }
      faq.category = categoryID;
    }
    if (question) faq.question = question;
    if (answer) faq.answer = answer;

    return await faq.save();
  }

  public async deleteFAQ(businessId: string, faqID: string) {
    const faq = await FAQ.findOneAndDelete(
      tenantScope({ _id: faqID }, businessId),
    );
    if (!faq) {
      throw new AppError(404, "FAQ not found");
    }
    return faq;
  }

  private async validateFAQCategory(businessId: string, categoryID: string) {
    const category = await FAQCategory.findOne(
      tenantScope({ _id: categoryID }, businessId),
    );
    if (!category) {
      return;
    }
    return category;
  }
}
