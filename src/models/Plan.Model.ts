import { Document, model, Schema } from "mongoose";

interface IPlans extends Document {
  name: string;
  status: string;
  pricePerUnit: number;
  minimumUnit: number;
  isDeleted?: boolean;
  __v?: number;
}

const PlanSchema = new Schema<IPlans>(
  {
    name: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    pricePerUnit: { type: Number },
    minimumUnit: { type: Number },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.isDeleted;
      },
    },
  }
);

export const Plans = model<IPlans>("Plans", PlanSchema);
