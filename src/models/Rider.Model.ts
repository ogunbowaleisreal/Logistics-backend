import { Document, model, Schema } from "mongoose";

interface IRider extends Document {
  businessId: Schema.Types.ObjectId;
  name: string;
  phone: string;
  dailyCapacity: number;
  totalDeliveries?: number;
  todaysRideCount?: number;
  rideType?: "bike" | "bus_car"  | "truck";
  status?: string;
  isDeleted?: boolean;
  __v?: number;
}

const RiderSchema = new Schema<IRider>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    name: { type: String, required: true, index: true },
    phone: { type: String, required: true },
    dailyCapacity: { type: Number, required: true, min: 0 },
    totalDeliveries: { type: Number, default: 0 },
    todaysRideCount: { type: Number, default: 0, min: 0 },
    rideType: { type: String, enum: ["bike", "bus_car", "truck"] },
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
  },
);

RiderSchema.index({ businessId: 1, phone: 1 }, { unique: true, sparse: true });

export const Rider = model<IRider>("Rider", RiderSchema);
