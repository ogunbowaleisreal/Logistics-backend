import { FAQ } from "../../models/FAQ.Model";
import AppError from "../../utilities/ErrorHandler";

export class GeneralFAQService {
  public async createFAQ(payload: {
    tag?: string;
    question: string;
    answer: string;
  }) {
    const { tag, question, answer } = payload;
    return await FAQ.create({ tag, question, answer });
  }

  public async getFAQs() {
    return await FAQ.find({ businessId: { $exists: false } }).sort({
      createdAt: -1,
    });
  }

  public async updateFAQ(payload: {
    faqID: string;
    tag?: string;
    question?: string;
    answer?: string;
  }) {
    const { faqID, tag, question, answer } = payload;
    const faq = await FAQ.findById(faqID);
    if (!faq) throw new AppError(404, "FAQ not found");
    if (tag !== undefined) faq.tag = tag;
    if (question !== undefined) faq.question = question;
    if (answer !== undefined) faq.answer = answer;
    return await faq.save();
  }

  public async deleteFAQ(faqID: string) {
    const faq = await FAQ.findByIdAndDelete(faqID);
    if (!faq) throw new AppError(404, "FAQ not found");
    return faq;
  }
}
