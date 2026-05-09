import { Schema, Document, model, Types } from "mongoose";

interface IBusinessShippingZone extends Document {
  businessId: Types.ObjectId;
  name: string;
  shippingType: 'local' | 'inter-state' | 'international';
  states: string[];
  pricing: {
    rideType: 'bike' | 'bus_car' | 'pickup' | 'truck';
    amount: number;
  }[];
  amount?: number;
  destinationStates?: string[];
  countries?: string[];
  cities?: string[];
}

const businessShippingZoneSchema = new Schema<IBusinessShippingZone>({
  businessId: {
    type: Schema.Types.ObjectId,
    ref: "Business",
    required: true,
  },
  name: { type: String, required: true },
  shippingType: {
    type: String,
    enum: ["local", "inter-state", "international"],
    default: "local",
  },
  states: [{ type: String }],
  pricing: [
    {
      rideType: { type: String, enum: ["bike", "bus_car", "pickup", "truck"], required: true },
      amount: { type: Number, required: true },
    },
  ],
  amount: { type: Number },
  destinationStates: [{ type: String }],
  countries: [{ type: String }],
  cities: [{ type: String }],
});

businessShippingZoneSchema.index({ businessId: 1, name: 1 }, { unique: true });

export const BusinessShippingZone = model(
  "BusinessShippingZone",
  businessShippingZoneSchema,
);

// Weight-based shipping rates removed — shipping fee is now a flat amount per zone.
// interface IBusinessShippingRate extends Document {
//   businessId: Types.ObjectId;
//   zoneId: Types.ObjectId;
//   key: string;
//   lowerBound: number;
//   upperBound: number;
//   amount: number;
//   currency: string;
// }

// const businessShippingRateSchema = new Schema<IBusinessShippingRate>(
//   {
//     businessId: {
//       type: Schema.Types.ObjectId,
//       ref: "Business",
//       required: true,
//     },
//     zoneId: {
//       type: Schema.Types.ObjectId,
//       ref: "BusinessShippingZone",
//       required: true,
//     },
//     key: { type: String, required: true },
//     lowerBound: { type: Number, required: true },
//     upperBound: { type: Number, required: true },
//     amount: { type: Number, required: true },
//     currency: { type: String, default: "NGN" },
//   },
//   { timestamps: true },
// );

// businessShippingRateSchema.index(
//   { businessId: 1, zoneId: 1, key: 1 },
//   { unique: true },
// );

// export const BusinessShippingRate = model(
//   "BusinessShippingRate",
//   businessShippingRateSchema,
// );
