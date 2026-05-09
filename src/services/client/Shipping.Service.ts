import {
  // BusinessShippingRate, // Removed: weight-based rates replaced by flat zone amount
  BusinessShippingZone,
} from "../../models/Shippings.model";
import { BusinessConfiguration } from "../../models/BusinessConfiguration.Model";
import { Rider } from "../../models/Rider.Model";
import { ShippingService as BusinessShippingService } from "../business/Shipping.Services";

const businessShippingService = new BusinessShippingService();

export class ShippingService {
  public async getBusinessZones(
    businessId: string,
    filter: { state?: string; shippingType?: string } = {},
  ) {
    const config = await BusinessConfiguration.findOne(
      { businessId },
      { shippingRegion: 1 },
    ).lean();

    const region = config?.shippingRegion ?? 'local';

    const shippingTypes = {
      local: true,
      interState: region === 'inter-state' || region === 'international',
      international: region === 'international',
    };

    const zoneQuery: any = { businessId };
    if (filter.state) {
      zoneQuery.states = { $regex: new RegExp(`^${filter.state}$`, "i") };
    }
    if (filter.shippingType) {
      zoneQuery.shippingType = filter.shippingType;
    }

    const zones = await BusinessShippingZone.find(zoneQuery).lean();
    return { shippingTypes, zones };
  }

  //   return zones.map((zone) => ({
  //     ...zone,
  //     rates: rates
  //       .filter((r) => r.zoneId.toString() === zone._id.toString())
  //       .map(({ key, lowerBound, upperBound, amount, currency }) => ({
  //         key,
  //         lowerBound,
  //         upperBound,
  //         amount,
  //         currency,
  //       }))
  //       .sort((a, b) => a.lowerBound - b.lowerBound),
  //   }));
  // }

  public async calculateFee(
    businessId: string,
    params: {
      shippingType: 'local' | 'inter-state' | 'international';
      rideType: 'bike' | 'bus_car' | 'pickup' | 'truck';
      zoneId?: string;
      distanceInKM?: number;
      originState?: string;
      destinationState?: string;
      country?: string;
      city?: string;
    },
  ): Promise<number> {
    return businessShippingService.calculateFee(businessId, params);
  }

  public async getAvailableRideTypes(businessId: string): Promise<{
    rideTypes: Array<{ type: string; label: string }>;
    default: string | null;
  }> {
    const labelMap: Record<string, string> = {
      bike: "Bike",
      bus_car: "Bus / Car",
      pickup: "Pickup",
      truck: "Truck",
    };

    const config = await BusinessConfiguration.findOne(
      { businessId },
      { rideTypeConfig: 1 },
    ).lean();

    const enabledTypes = (config?.rideTypeConfig ?? []).filter((r) => r.isEnabled);

    const checks = await Promise.all(
      enabledTypes.map((r) =>
        Rider.exists({ businessId, rideType: r.type, status: "active", isDeleted: false }),
      ),
    );

    const rideTypes = enabledTypes
      .filter((_, i) => checks[i])
      .map((r) => ({ type: r.type, label: labelMap[r.type] ?? r.type }));

    return {
      rideTypes,
      default: rideTypes.length === 1 ? rideTypes[0].type : null,
    };
  }
}
