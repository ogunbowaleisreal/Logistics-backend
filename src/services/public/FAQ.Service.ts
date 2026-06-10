import { FAQ } from "../../models/FAQ.Model";

export class FAQService {
  public async getFAQs() {
    return await FAQ.find({ businessId: { $exists: false } }).sort({
      createdAt: -1,
    });
  }
}
