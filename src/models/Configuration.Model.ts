import { Document, Schema, model } from "mongoose";

export interface IServiceFeeTier {
  minAmount: number;
  maxAmount: number | null;
  percentage: number;
}

export interface IAddress {
  street: string;
  city: string;
  state?: string;
  country: string;
}

export interface IContactInfo {
  phoneNumbers: string[];
  emails: string[];
  address: IAddress;
}

export interface IConfiguration extends Document {
  serviceFee: {
    tiers: IServiceFeeTier[];
    cap: number;
  };
  VAT: {
    type: string;
    value: number;
  };
  contactInfo: IContactInfo;
  __v?: number;
}

const DEFAULT_TIERS: IServiceFeeTier[] = [
  { minAmount: 0,         maxAmount: 5000,   percentage: 7.5 },
  { minAmount: 5000.01,   maxAmount: 10000,  percentage: 6.5 },
  { minAmount: 10000.01,  maxAmount: 50000,  percentage: 5   },
  { minAmount: 50000.01,  maxAmount: 150000, percentage: 2.5 },
  { minAmount: 150000.01, maxAmount: null,   percentage: 1   },
];

const ConfigurationSchema = new Schema<IConfiguration>(
  {
    serviceFee: {
      tiers: {
        type: [
          {
            minAmount:  { type: Number, required: true },
            maxAmount:  { type: Number, default: null },
            percentage: { type: Number, required: true },
          },
        ],
        default: DEFAULT_TIERS,
      },
      cap: { type: Number, default: 3000 },
    },
    VAT: {
      type: {
        type: String,
        enum: ["percentage", "fixed"],
        default: "percentage",
      },
      value: { type: Number, default: 7.5 },
    },
    contactInfo: {
      phoneNumbers: { type: [String], default: [] },
      emails: { type: [String], default: [] },
      address: {
        street:  { type: String, default: "" },
        city:    { type: String, default: "" },
        state:   { type: String, default: "" },
        country: { type: String, default: "" },
      },
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
