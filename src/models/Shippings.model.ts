import { Schema, Document, model, Types } from "mongoose";

interface ILocalZone extends Document {
  name: string;
  states: string[];
}

const localZoneSchema = new Schema<ILocalZone>({
  name: { type: String, required: true, unique: true },
  states: [{ type: String }],
});

export const LocalShippingZone = model("LocalShippingZone", localZoneSchema);

interface IBusinessShippingRate extends Document {
  businessId: Types.ObjectId;
  zoneId: Types.ObjectId;
  key: string;
  lowerBound: number;
  upperBound: number;
  amount: number;
  currency: string;
}

const businessShippingRateSchema = new Schema<IBusinessShippingRate>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    zoneId: {
      type: Schema.Types.ObjectId,
      ref: "LocalShippingZone",
      required: true,
    },
    key: { type: String, required: true },
    lowerBound: { type: Number, required: true },
    upperBound: { type: Number, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "NGN" },
  },
  { timestamps: true },
);

businessShippingRateSchema.index(
  { businessId: 1, zoneId: 1, key: 1 },
  { unique: true },
);

export const BusinessShippingRate = model(
  "BusinessShippingRate",
  businessShippingRateSchema,
);
