import { Document, model, Schema } from "mongoose";

interface IRider extends Document {
  name: string;
  phone: string;
  dailyCapacity: number;
  totalDeliveries?: number;
  status?: string;
  isDeleted?: boolean;
  __v?: number;
}

const RiderSchema = new Schema<IRider>(
  {
    name: { type: String, required: true, index: true },
    phone: { type: String, required: true, index: true },
    dailyCapacity: { type: Number, required: true, min: 0 },
    totalDeliveries: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.isDeleted;
        delete ret.__v;
      },
    },
  }
);

export const Rider = model<IRider>("Rider", RiderSchema);
