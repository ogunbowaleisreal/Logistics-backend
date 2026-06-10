import { Waitlist } from "../../models/Waitlist.Model";
import { paginateModel } from "../../utilities/Pagination.Helper";

export class WaitlistService {
  public async getWaitlist(filter: any) {
    const { page, limit, search, startDate, endDate } = filter;

    const queryClauses: any[] = [];

    if (search) {
      queryClauses.push({
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { businessName: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      });
    }

    if (startDate || endDate) {
      const dateFilter: any = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate) dateFilter.$lte = new Date(endDate);
      queryClauses.push({ createdAt: dateFilter });
    }

    const query = queryClauses.length > 0 ? { $and: queryClauses } : {};

    return await paginateModel(Waitlist, query, page, limit, { createdAt: -1 });
  }
}
