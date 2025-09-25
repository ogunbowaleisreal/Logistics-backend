import { Document, model, Schema } from "mongoose";

export interface IConfiguration extends Document {
  pricePerKm?: number;
  minimumCharge?: number;
  __v?: number;
}

const ConfigurationSchema = new Schema<IConfiguration>(
  {
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
  }
);

export const Configuration = model<IConfiguration>(
  "Configuration",
  ConfigurationSchema
);
