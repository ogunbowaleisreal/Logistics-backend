import { Document, model, Schema } from "mongoose";

export interface IConfiguration extends Document {
  businessId: Schema.Types.ObjectId;
  pricePerKm?: number;
  minimumCharge?: number;
  __v?: number;
}

const ConfigurationSchema = new Schema<IConfiguration>(
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
ConfigurationSchema.index({ businessId: 1 }, { unique: true, sparse: true });

export const Configuration = model<IConfiguration>(
  "Configuration",
  ConfigurationSchema,
);
