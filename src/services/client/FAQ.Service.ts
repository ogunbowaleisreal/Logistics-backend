import { FAQ } from "../../models/FAQ.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModel } from "../../utilities/Pagination.Helper";

export class FAQService {
  public async getFAQs(businessId: string, filter: any) {
    const { faqID, tag, search, page, limit } = filter;
    const queryClauses: any[] = [
      {


        $or: [{ businessId }, { businessId: { $exists: false } }],
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
      const faq = await FAQ.findOne({
        $and: [query, { _id: faqID }],
      });
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
}
