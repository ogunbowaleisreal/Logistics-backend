import { Document, model, Schema } from "mongoose";

export interface IBusinessConfiguration extends Document {
  businessId: Schema.Types.ObjectId;
  shippingSettings?: string;
  rideTypeConfig?: {
    type: "bike" | "bus_car" | "pickup" | "truck" | "cargo";
    isEnabled: boolean;
    pricePerKm: number;
    baseAmount: number;
  }[];
  shippingRegion?: string;
  __v?: number;
}

const BusinessConfigurationSchema = new Schema<IBusinessConfiguration>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    shippingSettings: {
      type: String,
      enum: ["distance-based", "zone-based"],
      default: "distance-based",
    },
    rideTypeConfig: [
      {
        type: {
          type: String,
          enum: ["bike", "bus_car", "pickup", "truck", "cargo"],
          required: true,
        },
        isEnabled: { type: Boolean, default: false },
        pricePerKm: { type: Number, default: 0 },
        baseAmount: { type: Number, default: 0 },
      },
    ],
    shippingRegion: {
      type: String,
      enum: ["local", "inter-state", "international"],
      default: "local",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
      },
    },
  },
);

// One config per business
BusinessConfigurationSchema.index(
  { businessId: 1 },
  { unique: true, sparse: true },
);

export const BusinessConfiguration = model<IBusinessConfiguration>(
  "BusinessConfiguration",
  BusinessConfigurationSchema,
);
