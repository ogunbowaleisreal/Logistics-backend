import { Schema, Document, model } from "mongoose";
import { IWeightBracket } from "./Shippings.model";

export interface IGlobalShippingZone extends Document {
  name: string;
  description?: string;
  shippingType: "local" | "inter-state" | "international";
  states: string[];
  pricing: {
    rideType: "bike" | "bus_car" | "truck" | "cargo";
    amount: number;
  }[];
  weightBrackets: IWeightBracket[];
  useWeightBrackets: boolean;
  destinationStates?: string[];
  countries?: string[];
  cities?: string[];
}

const globalShippingZoneSchema = new Schema<IGlobalShippingZone>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    shippingType: {
      type: String,
      enum: ["local", "inter-state", "international"],
      default: "local",
    },
    states: [{ type: String }],
    pricing: [
      {
        rideType: {
          type: String,
          enum: ["bike", "bus_car", "truck", "cargo"],
          required: true,
        },
        amount: { type: Number, required: true },
      },
    ],
    weightBrackets: [
      {
        rideType: {
          type: String,
          enum: ["bike", "bus_car", "truck", "cargo"],
          required: true,
        },
        minKg: { type: Number, required: true },
        maxKg: { type: Number, required: true },
        amount: { type: Number, required: true },
      },
    ],
    useWeightBrackets: { type: Boolean, default: false },
    destinationStates: [{ type: String }],
    countries: [{ type: String }],
    cities: [{ type: String }],
  },
  { timestamps: true },
);

export const GlobalShippingZone = model<IGlobalShippingZone>(
  "GlobalShippingZone",
  globalShippingZoneSchema,
);
