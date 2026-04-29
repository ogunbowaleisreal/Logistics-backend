import { BusinessShippingZone } from "../../models/Shippings.model";

export class ShippingService {
  public async getZones(filter: { businessId?: string }) {
    const query: any = {};
    if (filter.businessId) query.businessId = filter.businessId;
    return await BusinessShippingZone.find(query)
      .populate("businessId", "name")
      .sort({ businessId: 1, name: 1 });
  }
}
