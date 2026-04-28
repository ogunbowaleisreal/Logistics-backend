import { LocalShippingZone } from "../../models/Shippings.model";
import AppError from "../../utilities/ErrorHandler";

export class ShippingService {
  public async createZone(payload: { name: string; states: string[] }) {
    const exists = await LocalShippingZone.findOne({ name: payload.name });
    if (exists) throw new AppError(400, "Zone with this name already exists");
    return await LocalShippingZone.create(payload);
  }

  public async getZones() {
    return await LocalShippingZone.find().sort({ name: 1 });
  }

  public async updateZone(
    zoneId: string,
    payload: { name?: string; states?: string[] },
  ) {
    const zone = await LocalShippingZone.findById(zoneId);
    if (!zone) throw new AppError(404, "Zone not found");
    if (payload.name) zone.name = payload.name;
    if (payload.states) zone.states = payload.states;
    return await zone.save();
  }

  public async deleteZone(zoneId: string) {
    const zone = await LocalShippingZone.findByIdAndDelete(zoneId);
    if (!zone) throw new AppError(404, "Zone not found");
    return zone;
  }
}
