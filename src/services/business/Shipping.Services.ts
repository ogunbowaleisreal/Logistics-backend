import { Types } from "mongoose";
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
    payload: {
      name: string;
      states?: string[];
      shippingType?: "local" | "inter-state" | "international";
      pricing: {
        rideType: "bike" | "bus_car" | "truck" | "cargo";
        amount: number;
      }[];
      destinationStates?: string[];
      countries?: string[];
      cities?: string[];
    },
  ) {
    const exists = await BusinessShippingZone.findOne({
      businessId,
      name: payload.name,
    });
    if (exists) throw new AppError(400, "Zone with this name already exists");
    return await BusinessShippingZone.create({ ...payload, businessId });
  }

  public async getZones(
    businessId: string,
    filter: { shippingType?: string } = {},
  ) {
    const query: any = { businessId };
    if (filter.shippingType) query.shippingType = filter.shippingType;
    return await BusinessShippingZone.find(query).sort({ name: 1 });
  }

  public async updateZone(
    businessId: string,
    zoneId: string,
    payload: {
      name?: string;
      states?: string[];
      shippingType?: "local" | "inter-state" | "international";
      pricing?: {
        rideType: "bike" | "bus_car" | "truck" | "cargo";
        amount: number;
      }[];
      destinationStates?: string[];
      countries?: string[];
      cities?: string[];
    },
  ) {
    const zone = await BusinessShippingZone.findOne({
      _id: zoneId,
      businessId,
    });
    if (!zone) throw new AppError(404, "Zone not found");
    if (payload.name !== undefined) zone.name = payload.name;
    if (payload.states !== undefined) zone.states = payload.states;
    if (payload.shippingType !== undefined)
      zone.shippingType = payload.shippingType;
    if (payload.pricing !== undefined) zone.pricing = payload.pricing;
    if (payload.destinationStates !== undefined)
      zone.destinationStates = payload.destinationStates;
    if (payload.countries !== undefined) zone.countries = payload.countries;
    if (payload.cities !== undefined) zone.cities = payload.cities;
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

  private bracketsOverlap(
    a: { minKg: number; maxKg: number },
    b: { minKg: number; maxKg: number },
  ): boolean {
    return a.minKg <= b.maxKg && a.maxKg >= b.minKg;
  }

  public async bulkUpsertWeightBrackets(
    businessId: string,
    zoneId: string,
    incoming: {
      rideType: "bike" | "bus_car" | "truck";
      minKg: number;
      maxKg: number;
      amount: number;
    }[],
  ) {
    const zone = await BusinessShippingZone.findOne({
      _id: zoneId,
      businessId,
    });
    if (!zone) throw new AppError(404, "Zone not found");

    // Check for overlaps within the incoming array itself
    for (let i = 0; i < incoming.length; i++) {
      for (let j = i + 1; j < incoming.length; j++) {
        const a = incoming[i];
        const b = incoming[j];
        if (
          a.rideType === b.rideType &&
          !(a.minKg === b.minKg && a.maxKg === b.maxKg) &&
          this.bracketsOverlap(a, b)
        ) {
          throw new AppError(
            400,
            `Overlapping weight brackets in request for rideType '${a.rideType}'`,
          );
        }
      }
    }

    for (const bracket of incoming) {
      const existingIndex = zone.weightBrackets.findIndex(
        (b) =>
          b.rideType === bracket.rideType &&
          b.minKg === bracket.minKg &&
          b.maxKg === bracket.maxKg,
      );

      if (existingIndex !== -1) {
        zone.weightBrackets[existingIndex].amount = bracket.amount;
      } else {
        const overlaps = zone.weightBrackets.some(
          (b) =>
            b.rideType === bracket.rideType && this.bracketsOverlap(b, bracket),
        );
        if (overlaps) {
          throw new AppError(
            400,
            `Overlapping weight bracket exists for rideType '${bracket.rideType}' (${bracket.minKg}–${bracket.maxKg} kg)`,
          );
        }
        zone.weightBrackets.push(bracket);
      }
    }

    await zone.save();
    return zone.weightBrackets;
  }

  public async getWeightBrackets(businessId: string, zoneId: string) {
    const zone = await BusinessShippingZone.findOne(
      { _id: zoneId, businessId },
      { weightBrackets: 1 },
    ).lean();
    if (!zone) throw new AppError(404, "Zone not found");
    return zone.weightBrackets ?? [];
  }

  public async updateWeightBracket(
    businessId: string,
    zoneId: string,
    bracketId: string,
    payload: {
      rideType?: "bike" | "bus_car" | "truck";
      minKg?: number;
      maxKg?: number;
      amount?: number;
    },
  ) {
    const setPayload: Record<string, any> = {};
    if (payload.rideType !== undefined)
      setPayload["weightBrackets.$.rideType"] = payload.rideType;
    if (payload.minKg !== undefined)
      setPayload["weightBrackets.$.minKg"] = payload.minKg;
    if (payload.maxKg !== undefined)
      setPayload["weightBrackets.$.maxKg"] = payload.maxKg;
    if (payload.amount !== undefined)
      setPayload["weightBrackets.$.amount"] = payload.amount;

    const zone = await BusinessShippingZone.findOneAndUpdate(
      {
        _id: zoneId,
        businessId,
        "weightBrackets._id": new Types.ObjectId(bracketId),
      },
      { $set: setPayload },
      { new: true },
    );
    if (!zone) throw new AppError(404, "Zone or weight bracket not found");
    return zone.weightBrackets;
  }

  public async deleteWeightBracket(
    businessId: string,
    zoneId: string,
    bracketId: string,
  ) {
    const exists = await BusinessShippingZone.exists({
      _id: zoneId,
      businessId,
      "weightBrackets._id": new Types.ObjectId(bracketId),
    });
    if (!exists) throw new AppError(404, "Zone or weight bracket not found");
    const zone = await BusinessShippingZone.findOneAndUpdate(
      { _id: zoneId, businessId },
      { $pull: { weightBrackets: { _id: new Types.ObjectId(bracketId) } } },
      { new: true },
    );
    return zone!.weightBrackets;
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

  private resolveZoneFee(
    zone: {
      pricing: { rideType: string; amount: number }[];
      weightBrackets?: {
        rideType: string;
        minKg: number;
        maxKg: number;
        amount: number;
      }[];
    },
    rideType: string,
    weightKg?: number,
  ): number {
    if (weightKg !== undefined && zone.weightBrackets?.length) {
      const bracket = zone.weightBrackets.find(
        (b) =>
          b.rideType === rideType && weightKg >= b.minKg && weightKg <= b.maxKg,
      );
      if (bracket) return bracket.amount;
    }
    const entry = zone.pricing.find((p) => p.rideType === rideType);
    if (!entry)
      throw new AppError(
        400,
        `No pricing for ride type '${rideType}' in this zone`,
      );
    return entry.amount;
  }

  public async calculateFee(
    businessId: string,
    params: {
      shippingType: "local" | "inter-state" | "international";
      rideType: "bike" | "bus_car" | "truck" | "cargo";
      zoneId?: string;
      distanceInKM?: number;
      weightKg?: number;
      originState?: string;
      destinationState?: string;
      country?: string;
      city?: string;
    },
  ): Promise<number> {
    const {
      shippingType,
      rideType,
      zoneId,
      distanceInKM,
      weightKg,
      originState,
      destinationState,
      country,
      city,
    } = params;

    if (shippingType === "local") {
      if (zoneId) {
        const zone = await BusinessShippingZone.findOne({
          _id: zoneId,
          businessId,
          shippingType: "local",
        });
        if (!zone) throw new AppError(400, "No local shipping zone found");
        return this.resolveZoneFee(zone, rideType, weightKg);
      }

      if (distanceInKM) {
        const config = await BusinessConfiguration.findOne(
          { businessId },
          { rideTypeConfig: 1 },
        ).lean();
        if (!config)
          throw new AppError(400, "Business shipping settings not found");

        const rideTypeConfig = config.rideTypeConfig?.find(
          (r) => r.type === rideType && r.isEnabled,
        );
        if (rideTypeConfig) {
          return Math.max(
            distanceInKM * rideTypeConfig.pricePerKm,
            rideTypeConfig.baseAmount,
          );
        } else {
          throw new AppError(
            400,
            `Ride type '${rideType}' is not enabled for this business`,
          );
        }
      }

      throw new AppError(
        400,
        "Either zoneId or distanceInKM must be provided for local shipping",
      );
    }

    if (shippingType === "inter-state") {
      if (!originState || !destinationState) {
        throw new AppError(
          400,
          "originState and destinationState are required for inter-state shipping",
        );
      }
      const zone = await BusinessShippingZone.findOne({
        businessId,
        shippingType: "inter-state",
        states: { $regex: new RegExp(`^${originState}$`, "i") },
        destinationStates: { $regex: new RegExp(`^${destinationState}$`, "i") },
      });
      if (!zone)
        throw new AppError(400, "No inter-state zone found for this route");
      return this.resolveZoneFee(zone, rideType, weightKg);
    }

    if (shippingType === "international") {
      if (!country) {
        throw new AppError(
          400,
          "country is required for international shipping",
        );
      }
      const zoneQuery: any = {
        businessId,
        shippingType: "international",
        countries: { $regex: new RegExp(`^${country}$`, "i") },
      };
      if (city) {
        zoneQuery.$or = [
          { cities: { $size: 0 } },
          { cities: { $regex: new RegExp(`^${city}$`, "i") } },
        ];
      }
      const zone = await BusinessShippingZone.findOne(zoneQuery);
      if (!zone)
        throw new AppError(
          400,
          "No international zone found for this destination",
        );
      return this.resolveZoneFee(zone, rideType, weightKg);
    }

    throw new AppError(400, "Invalid shipping type");
  }
}
