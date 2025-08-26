import { FAQ, FAQCategory } from "../../models/FAQ.Model";
import AppError from "../../utilities/ErrorHandler";
import {
  paginateModel,
  paginateModelWithPopulate,
} from "../../utilities/Pagination.Helper";

export class FAQCategoryService {
  public async createFAQCategory(payload: any) {
    const faqCategory = await FAQCategory.create(payload);
    return faqCategory;
  }

  public async getFAQCategories(filter: any) {
    const { categoryID, status, search, page, limit } = filter;
    if (categoryID) {
      const category = await FAQCategory.findOne({ _id: categoryID });
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

    const faqCategories = await paginateModel(FAQCategory, query, page, limit);
    return faqCategories;
  }

  public async updateFAQCategory(payload: any) {
    const { categoryID, ...rest } = payload;

    const faqCategory = await FAQCategory.findOneAndUpdate(
      { _id: categoryID },
      rest,
      {
        new: true,
      }
    );
    if (!faqCategory) {
      throw new AppError(404, "FAQ category not found");
    }
    return faqCategory;
  }
}

export class FAQService {
  public async createFAQ(payload: any) {
    const category = await this.validateFAQCategory(payload.categoryID);
    if (!category) {
      throw new AppError(404, "FAQ category not found");
    }
    payload.category = payload.categoryID;
    const faq = await FAQ.create(payload);
    return faq;
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

  public async updateFAQ(payload: any) {
    const { faqID, categoryID, question, answer } = payload;
    const faq = await FAQ.findOneAndUpdate({ _id: faqID });
    if (!faq) {
      throw new AppError(404, "FAQ not found");
    }
    if (categoryID) {
      const existingCategory = await this.validateFAQCategory(categoryID);
      if (!existingCategory) {
        throw new AppError(404, "FAQ category not found");
      }
      faq.category = categoryID;
    }
    if (question) faq.question = question;
    if (answer) faq.answer = answer;

    return await faq.save();
  }

  public async deleteFAQ(faqID: string) {
    const faq = await FAQ.findOneAndDelete({ _id: faqID });
    if (!faq) {
      throw new AppError(404, "FAQ not found");
    }
    return faq;
  }

  private async validateFAQCategory(categoryID: string) {
    const category = await FAQCategory.findOne({ _id: categoryID });
    if (!category) {
      return;
    }
    return category;
  }
}
