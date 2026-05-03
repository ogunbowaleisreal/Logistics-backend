import { Document, Schema, model } from "mongoose";

export interface IConfiguration extends Document {
  serviceFee: {
    type: string;
    value: number;
  };
  VAT: {
    type: string;
    value: number;
  };
  __v?: number;
}

const ConfigurationSchema = new Schema<IConfiguration>(
  {
    serviceFee: {
      type: {
        type: String,
        enum: ["percentage", "fixed"],
        default: "percentage",
      },
      value: { type: Number, default: 10 },
    },
    VAT: {
      type: {
        type: String,
        enum: ["percentage", "fixed"],
        default: "percentage",
      },
      value: { type: Number, default: 7.5 },
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

export const Configuration = model<IConfiguration>(
  "Configuration",
  ConfigurationSchema,
);
