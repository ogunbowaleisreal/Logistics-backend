import { Document, model, Schema } from "mongoose";

interface IColor extends Document {
  name: string;
  hex: string;
  status: string;
  isDeleted?: boolean;
  __v?: number;
}

const ColorSchema = new Schema<IColor>(
  {
    name: { type: String, required: true },
    hex: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.isDeleted;
      },
    },
  }
);

export const Color = model<IColor>("Color", ColorSchema);
