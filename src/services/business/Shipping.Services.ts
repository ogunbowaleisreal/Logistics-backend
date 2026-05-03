import { BusinessConfiguration } from "../../models/BusinessConfiguration.Model";
import {
  // BusinessShippingRate, // Removed: weight-based rates replaced by flat zone amount
  BusinessShippingZone,
} from "../../models/Shippings.model";
import AppError from "../../utilities/ErrorHandler";

// interface IRateInput {
//   key: string;
//   lowerBound: number;
//   upperBound: number;
//   amount: number;
// }

export class ShippingService {
  public async createZone(
    businessId: string,
    payload: { name: string; states: string[]; amount: number },
  ) {
    const exists = await BusinessShippingZone.findOne({
      businessId,
      name: payload.name,
    });
    if (exists) throw new AppError(400, "Zone with this name already exists");
    return await BusinessShippingZone.create({ ...payload, businessId });
  }

  public async getZones(businessId: string) {
    return await BusinessShippingZone.find({ businessId }).sort({ name: 1 });
  }

  public async updateZone(
    businessId: string,
    zoneId: string,
    payload: { name?: string; states?: string[]; amount?: number },
  ) {
    const zone = await BusinessShippingZone.findOne({
      _id: zoneId,
      businessId,
    });
    if (!zone) throw new AppError(404, "Zone not found");
    if (payload.name !== undefined) zone.name = payload.name;
    if (payload.states !== undefined) zone.states = payload.states;
    if (payload.amount !== undefined) zone.amount = payload.amount;
    return await zone.save();
  }

  public async deleteZone(businessId: string, zoneId: string) {
    const zone = await BusinessShippingZone.findOneAndDelete({
      _id: zoneId,
      businessId,
    });
    if (!zone) throw new AppError(404, "Zone not found");
    // await BusinessShippingRate.deleteMany({ businessId, zoneId }); // Removed: no more weight-based rates
    return zone;
  }

  // public async upsertRates(
  //   businessId: string,
  //   payload: { zoneId: string; rates: IRateInput[] },
  // ) {
  //   const { zoneId, rates } = payload;
  //   const zone = await BusinessShippingZone.findOne({ _id: zoneId, businessId });
  //   if (!zone) throw new AppError(404, "Zone not found");
  //   const bId = new Types.ObjectId(businessId);
  //   const zId = new Types.ObjectId(zoneId);
  //   const ops = rates.map((rate) => ({
  //     updateOne: {
  //       filter: { businessId: bId, zoneId: zId, key: rate.key },
  //       update: { $set: { ...rate, businessId: bId, zoneId: zId } },
  //       upsert: true,
  //     },
  //   }));
  //   await BusinessShippingRate.bulkWrite(ops);
  //   return await BusinessShippingRate.find({ businessId, zoneId }).populate("zoneId", "name");
  // }

  // public async getRates(businessId: string, filter: { zoneId?: string }) {
  //   const query: any = { businessId };
  //   if (filter.zoneId) query.zoneId = filter.zoneId;
  //   return await BusinessShippingRate.find(query)
  //     .populate("zoneId", "name states")
  //     .sort({ zoneId: 1, lowerBound: 1 });
  // }

  // public async updateRate(
  //   businessId: string,
  //   rateId: string,
  //   payload: { key?: string; lowerBound?: number; upperBound?: number; amount?: number },
  // ) {
  //   const rate = await BusinessShippingRate.findOne({ _id: rateId, businessId });
  //   if (!rate) throw new AppError(404, "Rate not found");
  //   if (payload.key !== undefined) rate.key = payload.key;
  //   if (payload.lowerBound !== undefined) rate.lowerBound = payload.lowerBound;
  //   if (payload.upperBound !== undefined) rate.upperBound = payload.upperBound;
  //   if (payload.amount !== undefined) rate.amount = payload.amount;
  //   return await rate.save();
  // }

  // public async deleteRate(businessId: string, rateId: string) {
  //   const rate = await BusinessShippingRate.findOneAndDelete({ _id: rateId, businessId });
  //   if (!rate) throw new AppError(404, "Rate not found");
  //   return rate;
  // }

  public async calculateShippingFeeWithZoneId(
    businessId: string,
    zoneId: string,
  ): Promise<number> {
    const zone = await BusinessShippingZone.findOne({
      _id: zoneId,
      businessId,
    });
    if (!zone) {
      throw new AppError(400, "No shipping zone found");
    }
    return zone.amount;
  }

  public async calculateShippingFeeWithDistance(
    businessId: string,
    distanceInKM: number,
  ): Promise<number> {
    const businessConfiguration = await BusinessConfiguration.findOne({
      businessId,
    }).lean();
    if (!businessConfiguration) {
      throw new AppError(400, "Business shipping settings not found");
    }

    const pricePerKm = businessConfiguration.pricePerKm || 500; // default to 500 if not set
    const minimumCharge = businessConfiguration.minimumCharge || 2000; // default to 2000 if not set

    const calculatedFee = distanceInKM * pricePerKm;
    return calculatedFee < minimumCharge ? minimumCharge : calculatedFee;
  }
}
