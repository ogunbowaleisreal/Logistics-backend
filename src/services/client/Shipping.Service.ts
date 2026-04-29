import {
  BusinessShippingRate,
  BusinessShippingZone,
} from "../../models/Shippings.model";

export class ShippingService {
  public async getBusinessZones(businessId: string, state?: string) {
    const rates = await BusinessShippingRate.find({ businessId }).lean();

    if (!rates.length) return [];

    const zoneIds = [...new Set(rates.map((r) => r.zoneId.toString()))];

    const zoneQuery: any = { _id: { $in: zoneIds }, businessId };
    if (state) {
      zoneQuery.states = { $regex: new RegExp(`^${state}$`, "i") };
    }

    const zones = await BusinessShippingZone.find(zoneQuery).lean();

    return zones.map((zone) => ({
      ...zone,
      rates: rates
        .filter((r) => r.zoneId.toString() === zone._id.toString())
        .map(({ key, lowerBound, upperBound, amount, currency }) => ({
          key,
          lowerBound,
          upperBound,
          amount,
          currency,
        }))
        .sort((a, b) => a.lowerBound - b.lowerBound),
    }));
  }
}
