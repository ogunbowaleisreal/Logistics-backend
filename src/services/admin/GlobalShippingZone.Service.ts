import { Types } from "mongoose";
import {
  GlobalShippingZone,
  IGlobalShippingZone,
} from "../../models/GlobalShippingZone.model";
import { IWeightBracket } from "../../models/Shippings.model";
import AppError from "../../utilities/ErrorHandler";
import {
  validateNoInternalOverlaps,
  assertNoOverlapWithExisting,
} from "../../utilities/weightBrackets.util";

// weightBrackets intentionally excluded from create/update payloads —
// brackets are managed exclusively through the dedicated bracket endpoints below,
// mirroring the business-side zone flow.
type ZonePayload = Pick<IGlobalShippingZone,
  | "name"
  | "shippingType"
  | "states"
  | "pricing"
  | "useWeightBrackets"
  | "destinationStates"
  | "countries"
  | "cities"
> & { description?: string };

export class GlobalShippingZoneService {
  public async createZone(payload: ZonePayload) {
    const exists = await GlobalShippingZone.findOne({ name: payload.name });
    if (exists)
      throw new AppError(400, "A global zone with this name already exists");

    // Zones always start with no weight brackets and useWeightBrackets: false —
    // brackets get added afterwards via bulkUpsertWeightBrackets, which is what
    // flips useWeightBrackets to true.
    return await GlobalShippingZone.create({
      ...payload,
      weightBrackets: [],
      useWeightBrackets: false,
    });
  }

  public async getZones(filter: { shippingType?: string } = {}) {
    const query: any = {};
    if (filter.shippingType) query.shippingType = filter.shippingType;
    return await GlobalShippingZone.find(query).sort({ name: 1 });
  }

  public async getZone(id: string) {
    const zone = await GlobalShippingZone.findById(id);
    if (!zone) throw new AppError(404, "Global shipping zone not found");
    return zone;
  }

  public async updateZone(id: string, payload: Partial<ZonePayload>) {
    const zone = await GlobalShippingZone.findById(id);
    if (!zone) throw new AppError(404, "Global shipping zone not found");
    if (payload.name !== undefined) zone.name = payload.name;
    if (payload.description !== undefined) zone.description = payload.description;
    if (payload.shippingType !== undefined) zone.shippingType = payload.shippingType;
    if (payload.states !== undefined) zone.states = payload.states;
    if (payload.pricing !== undefined) zone.pricing = payload.pricing;
    if (payload.useWeightBrackets !== undefined)
      zone.useWeightBrackets = payload.useWeightBrackets;
    if (payload.destinationStates !== undefined)
      zone.destinationStates = payload.destinationStates;
    if (payload.countries !== undefined) zone.countries = payload.countries;
    if (payload.cities !== undefined) zone.cities = payload.cities;
    return await zone.save();
  }

  public async deleteZone(id: string) {
    const zone = await GlobalShippingZone.findByIdAndDelete(id);
    if (!zone) throw new AppError(404, "Global shipping zone not found");
    return zone;
  }

  // ---------- Weight bracket management (mirrors business-side ShippingService) ----------

  public async getWeightBrackets(zoneId: string) {
    const zone = await GlobalShippingZone.findById(zoneId, {
      weightBrackets: 1,
    }).lean();
    if (!zone) throw new AppError(404, "Global shipping zone not found");
    return zone.weightBrackets ?? [];
  }

  public async bulkUpsertWeightBrackets(
    zoneId: string,
    incoming: {
      rideType: "bike" | "bus_car" | "truck";
      minKg: number;
      maxKg: number;
      amount: number;
    }[],
  ) {
    const zone = await GlobalShippingZone.findById(zoneId);
    if (!zone) throw new AppError(404, "Global shipping zone not found");

    validateNoInternalOverlaps(incoming);

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
        assertNoOverlapWithExisting(zone.weightBrackets, bracket);
        zone.weightBrackets.push(bracket as IWeightBracket);
      }
    }

    // Adding brackets to a global template implies it's meant to be used —
    // flip the flag automatically, same as the derive-on-create logic used to do.
    zone.useWeightBrackets = true;

    await zone.save();
    return zone.weightBrackets;
  }

  public async updateWeightBracket(
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

    const zone = await GlobalShippingZone.findOneAndUpdate(
      {
        _id: zoneId,
        "weightBrackets._id": new Types.ObjectId(bracketId),
      },
      { $set: setPayload },
      { new: true },
    );
    if (!zone) throw new AppError(404, "Zone or weight bracket not found");
    return zone.weightBrackets;
  }

  public async deleteWeightBracket(zoneId: string, bracketId: string) {
    const exists = await GlobalShippingZone.exists({
      _id: zoneId,
      "weightBrackets._id": new Types.ObjectId(bracketId),
    });
    if (!exists) throw new AppError(404, "Zone or weight bracket not found");
    const zone = await GlobalShippingZone.findOneAndUpdate(
      { _id: zoneId },
      { $pull: { weightBrackets: { _id: new Types.ObjectId(bracketId) } } },
      { new: true },
    );
    return zone!.weightBrackets;
  }
}
// import {
//   GlobalShippingZone,
//   IGlobalShippingZone,
// } from "../../models/GlobalShippingZone.model";
// import AppError from "../../utilities/ErrorHandler";

// type ZonePayload = Pick<
//   IGlobalShippingZone,
//   | "name"
//   | "shippingType"
//   | "states"
//   | "pricing"
//   | "weightBrackets"
//   | "useWeightBrackets"
//   | "destinationStates"
//   | "countries"
//   | "cities"
// > & { description?: string };

// export class GlobalShippingZoneService {
//   public async createZone(payload: ZonePayload) {
//     const exists = await GlobalShippingZone.findOne({ name: payload.name });
//     if (exists) throw new AppError(400, "A global zone with this name already exists");
//     const useWeightBrackets =
//       payload.useWeightBrackets !== undefined
//         ? payload.useWeightBrackets
//         : Boolean(payload.weightBrackets?.length);
//     return await GlobalShippingZone.create({ ...payload, useWeightBrackets });
//   }

//   public async getZones(filter: { shippingType?: string } = {}) {
//     const query: any = {};
//     if (filter.shippingType) query.shippingType = filter.shippingType;
//     return await GlobalShippingZone.find(query).sort({ name: 1 });
//   }

//   public async getZone(id: string) {
//     const zone = await GlobalShippingZone.findById(id);
//     if (!zone) throw new AppError(404, "Global shipping zone not found");
//     return zone;
//   }

//   public async updateZone(id: string, payload: Partial<ZonePayload>) {
//     const zone = await GlobalShippingZone.findById(id);
//     if (!zone) throw new AppError(404, "Global shipping zone not found");
//     if (payload.name !== undefined) zone.name = payload.name;
//     if (payload.description !== undefined) zone.description = payload.description;
//     if (payload.shippingType !== undefined) zone.shippingType = payload.shippingType;
//     if (payload.states !== undefined) zone.states = payload.states;
//     if (payload.pricing !== undefined) zone.pricing = payload.pricing;
//     if (payload.weightBrackets !== undefined) zone.weightBrackets = payload.weightBrackets;
//     if (payload.useWeightBrackets !== undefined) zone.useWeightBrackets = payload.useWeightBrackets;
//     if (payload.destinationStates !== undefined) zone.destinationStates = payload.destinationStates;
//     if (payload.countries !== undefined) zone.countries = payload.countries;
//     if (payload.cities !== undefined) zone.cities = payload.cities;
//     return await zone.save();
//   }

//   public async deleteZone(id: string) {
//     const zone = await GlobalShippingZone.findByIdAndDelete(id);
//     if (!zone) throw new AppError(404, "Global shipping zone not found");
//     return zone;
//   }
// }
