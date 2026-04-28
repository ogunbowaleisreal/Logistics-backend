import {
  BusinessShippingRate,
  LocalShippingZone,
} from "../../models/Shippings.model";
import AppError from "../../utilities/ErrorHandler";

interface IRateInput {
  key: string;
  lowerBound: number;
  upperBound: number;
  amount: number;
}

export class ShippingService {
  public async getZones() {
    return await LocalShippingZone.find().sort({ name: 1 });
  }

  public async upsertRates(
    businessId: string,
    payload: { zoneId: string; rates: IRateInput[] },
  ) {
    const { zoneId, rates } = payload;

    const zone = await LocalShippingZone.findById(zoneId);
    if (!zone) throw new AppError(404, "Zone not found");

    const ops = rates.map((rate) => ({
      updateOne: {
        filter: { businessId, zoneId, key: rate.key },
        update: { $set: { ...rate, businessId, zoneId } },
        upsert: true,
      },
    }));

    await BusinessShippingRate.bulkWrite(ops);
    return await BusinessShippingRate.find({ businessId, zoneId }).populate(
      "zoneId",
      "name",
    );
  }

  public async getRates(businessId: string, filter: { zoneId?: string }) {
    const query: any = { businessId };
    if (filter.zoneId) query.zoneId = filter.zoneId;
    return await BusinessShippingRate.find(query)
      .populate("zoneId", "name states")
      .sort({ zoneId: 1, lowerBound: 1 });
  }

  public async updateRate(
    businessId: string,
    rateId: string,
    payload: { key?: string; lowerBound?: number; upperBound?: number; amount?: number },
  ) {
    const rate = await BusinessShippingRate.findOne({
      _id: rateId,
      businessId,
    });
    if (!rate) throw new AppError(404, "Rate not found");
    if (payload.key !== undefined) rate.key = payload.key;
    if (payload.lowerBound !== undefined) rate.lowerBound = payload.lowerBound;
    if (payload.upperBound !== undefined) rate.upperBound = payload.upperBound;
    if (payload.amount !== undefined) rate.amount = payload.amount;
    return await rate.save();
  }

  public async deleteRate(businessId: string, rateId: string) {
    const rate = await BusinessShippingRate.findOneAndDelete({
      _id: rateId,
      businessId,
    });
    if (!rate) throw new AppError(404, "Rate not found");
    return rate;
  }

  public async calculateShippingFee(
    businessId: string,
    zoneId: string,
    itemWeight: number,
  ): Promise<number> {
    const rate = await BusinessShippingRate.findOne({
      businessId,
      zoneId,
      lowerBound: { $lte: itemWeight },
      upperBound: { $gte: itemWeight },
    });

    if (!rate) {
      throw new AppError(
        400,
        "No shipping rate found for the selected zone and item weight",
      );
    }

    return rate.amount;
  }
}
