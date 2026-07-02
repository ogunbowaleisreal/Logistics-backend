import { FAQ } from "../../models/FAQ.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModel } from "../../utilities/Pagination.Helper";

export class FAQService {
  public async createFAQ(businessId: string, payload: any) {
    const { businessId: _payloadBusinessId, ...faqPayload } = payload;
    const faq = await FAQ.create({ ...faqPayload, businessId });
    return faq;
  }

  public async getFAQs(businessId: string, filter: any) {
    const { faqID, tag, search, page, limit } = filter;
    const queryClauses: any[] = [
      {
        businessId,
      },
    ];

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

    const query = { $and: queryClauses };

    if (faqID) {
      const faq = await FAQ.findOne({ _id: faqID, businessId });
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

  public async updateFAQ(businessId: string, payload: any) {
    const { faqID, tag, question, answer } = payload;
    const faq = await FAQ.findOne({ _id: faqID, businessId });
    if (!faq) {
      throw new AppError(404, "FAQ not found");
    }
    if (tag) faq.tag = tag;
    if (question) faq.question = question;
    if (answer) faq.answer = answer;

    return await faq.save();
  }

  public async deleteFAQ(businessId: string, faqID: string) {
    const faq = await FAQ.findOneAndDelete({ _id: faqID, businessId });
    if (!faq) {
      throw new AppError(404, "FAQ not found");
    }
    return faq;
  }
}
