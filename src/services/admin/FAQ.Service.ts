import { FAQ } from "../../models/FAQ.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModel } from "../../utilities/Pagination.Helper";
import { tenantScope } from "../../utilities/TenantScope";

export class FAQService {
  public async createFAQ(businessId: string | undefined, payload: any) {
    const { businessId: payloadBusinessId, ...faqPayload } = payload;
    const faq = await FAQ.create(
      businessId ? { ...faqPayload, businessId } : faqPayload,
    );
    return faq;
  }

  public async getFAQs(businessId: string | undefined, filter: any) {
    const { faqID, tag, search, page, limit, general } = filter;
    const isGeneralFilter = general === true || general === "true";

    const queryClauses: any[] = [];

    if (businessId) {
      queryClauses.push(tenantScope({}, businessId));
    } else if (isGeneralFilter) {
      queryClauses.push({ businessId: { $exists: false } });
    }

    if (tag) {
      queryClauses.push({ tag });
    }

    if (search) {
      queryClauses.push({
        $or: [
          { question: { $regex: search, $options: "i" } },
          { answer: { $regex: search, $options: "i" } },
        ],
      });
    }

    const query = queryClauses.length > 0 ? { $and: queryClauses } : {};

    if (faqID) {
      const faq = await FAQ.findOne({ ...query, _id: faqID });
      if (!faq) {
        throw new AppError(404, "FAQ not found");
      }
      return faq;
    }
    const faqs = await paginateModel(FAQ, query, page, limit, {
      createdAt: -1,
    });
    return faqs;
  }

  public async updateFAQ(payload: any) {
    const { faqID, tag, question, answer } = payload;
    const faq = await FAQ.findById(faqID);
    if (!faq) {
      throw new AppError(404, "FAQ not found");
    }
    if (tag) faq.tag = tag;
    if (question) faq.question = question;
    if (answer) faq.answer = answer;

    return await faq.save();
  }

  public async deleteFAQ(faqID: string) {
    const faq = await FAQ.findByIdAndDelete(faqID);
    if (!faq) {
      throw new AppError(404, "FAQ not found");
    }
    return faq;
  }
}
