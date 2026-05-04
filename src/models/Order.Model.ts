import { Document, model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

interface IOrder extends Document {
  businessId: Schema.Types.ObjectId;
  zoneId?: Schema.Types.ObjectId;
  distanceInKM?: number;
  trackingID: string;
  orderInformation: {
    pickupLocation: {
      address: string;
      latitude: number;
      longitude: number;
    };
    dropoffLocation: {
      address: string;
      latitude: number;
      longitude: number;
    };
    items: string[];
    numberOfItems: number;
    itemWeight: number;
    value: number;
  };
  personnelInformation: {
    sender: { name: string; email?: string; phone: string };
    receiver: { name: string; phone: string };
  };
  status: string;
  paymentMethod: string;
  riderID?: string;
  amount: number;
  serviceFee?: number;
  VAT?: number;
  totalAmount: number;
  virtualAccountData?: {
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    expiryDate?: string;
    sessionId?: string;
    callbackURL?: string;
  };
  __v?: number;
}

const OrderSchema = new Schema<IOrder>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    trackingID: {
      type: String,
      unique: true,
      required: true,
      index: true,
      default: () =>
        `SME-${uuidv4().slice(0, 10).replace(/-/g, "").toUpperCase()}`,
    },
    orderInformation: {
      pickupLocation: {
        address: { type: String },
        latitude: { type: Number },
        longitude: { type: Number },
      },
      dropoffLocation: {
        address: { type: String },
        latitude: { type: Number },
        longitude: { type: Number },
      },
      items: [{ type: String }],
      numberOfItems: { type: Number },
      itemWeight: { type: Number },
      value: { type: Number },
    },
    personnelInformation: {
      sender: {
        name: { type: String },
        email: { type: String },
        phone: { type: String },
      },
      receiver: {
        name: { type: String },
        phone: { type: String },
      },
    },
    riderID: { type: Schema.Types.ObjectId, ref: "Rider" },
    distanceInKM: { type: Number },
    zoneId: { type: Schema.Types.ObjectId, ref: "BusinessShippingZone" },
    status: {
      type: String,
      enum: ["pending", "paid", "in-transit", "delivered", "canceled", "failed"],
      default: "pending",
    },
    paymentMethod: { type: String, enum: ["safehaven", "monnify"] },
    amount: { type: Number, min: 0, required: true },
    serviceFee: { type: Number, min: 0 },
    VAT: { type: Number, min: 0 },
    totalAmount: { type: Number, min: 0, required: true },
    virtualAccountData: {
      accountNumber: { type: String },
      accountName: { type: String },
      bankName: { type: String },
      expiryDate: { type: String },
      sessionId: { type: String },
      callbackURL: { type: String },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
      },
    },
  },
);

OrderSchema.index({ businessId: 1, status: 1 });
OrderSchema.index({ businessId: 1, trackingID: 1 });

export const Order = model<IOrder>("Order", OrderSchema);
