import { Document, model, Schema } from "mongoose";

export interface IBusinessConfiguration extends Document {
  businessId: Schema.Types.ObjectId;
  pricePerKm?: number;
  minimumCharge?: number;
  __v?: number;
}

const BusinessConfigurationSchema = new Schema<IBusinessConfiguration>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    pricePerKm: { type: Number, default: 500 },
    minimumCharge: { type: Number, default: 2000 },
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
