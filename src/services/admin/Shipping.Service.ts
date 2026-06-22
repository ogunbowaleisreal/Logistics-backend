import { BusinessShippingZone } from "../../models/Shippings.model";

export class ShippingService {
  public async getZones(filter: {
    businessId?: string;
    shippingType?: string;
  }) {
    const shippingType = filter.shippingType;
    const query: any = {};
    if (filter.businessId) query.businessId = filter.businessId;
    if (filter.shippingType) {
      if (shippingType === "manual") {
        query.shippingType = { $in: ["local", "inter-state"] };
      } else if (shippingType === "international") {
        query.shippingType = { $in: ["international"] };
      }
    }
    return await BusinessShippingZone.find(query)
      .populate("businessId", "name")
      .sort({ businessId: 1, name: 1 });
  }
}
