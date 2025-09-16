import { Document, model, Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

interface IOrder extends Document {
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
    sender: {
      name: string;
      email?: string;
      phone: string;
    };
    receiver: {
      name: string;
      phone: string;
    };
  };
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  bankID?: string;
  proofOfPayment?: string;
  amount: number;
  __v?: number;
}

const OrderSchema = new Schema<IOrder>(
  {
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
    status: {
      type: String,
      enum: ["pending", "in-transit", "delivered", "cancelled"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "bank-transfer"],
    },
    amount: { type: Number },
    bankID: { type: String },
    proofOfPayment: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
      },
    },
  }
);

OrderSchema.index({ trackingNumber: 1 }, { unique: true });

export const Order = model<IOrder>("Order", OrderSchema);
