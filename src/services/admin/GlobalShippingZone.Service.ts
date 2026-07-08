import {
  GlobalShippingZone,
  IGlobalShippingZone,
} from "../../models/GlobalShippingZone.model";
import AppError from "../../utilities/ErrorHandler";

type ZonePayload = Pick<
  IGlobalShippingZone,
  | "name"
  | "shippingType"
  | "states"
  | "pricing"
  | "weightBrackets"
  | "useWeightBrackets"
  | "destinationStates"
  | "countries"
  | "cities"
> & { description?: string };

export class GlobalShippingZoneService {
  public async createZone(payload: ZonePayload) {
    const exists = await GlobalShippingZone.findOne({ name: payload.name });
    if (exists) throw new AppError(400, "A global zone with this name already exists");
    const useWeightBrackets =
      payload.useWeightBrackets !== undefined
        ? payload.useWeightBrackets
        : Boolean(payload.weightBrackets?.length);
    return await GlobalShippingZone.create({ ...payload, useWeightBrackets });
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
    if (payload.weightBrackets !== undefined) zone.weightBrackets = payload.weightBrackets;
    if (payload.useWeightBrackets !== undefined) zone.useWeightBrackets = payload.useWeightBrackets;
    if (payload.destinationStates !== undefined) zone.destinationStates = payload.destinationStates;
    if (payload.countries !== undefined) zone.countries = payload.countries;
    if (payload.cities !== undefined) zone.cities = payload.cities;
    return await zone.save();
  }

  public async deleteZone(id: string) {
    const zone = await GlobalShippingZone.findByIdAndDelete(id);
    if (!zone) throw new AppError(404, "Global shipping zone not found");
    return zone;
  }
}
