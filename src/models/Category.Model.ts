import { Document, model, Schema } from "mongoose";

interface ICategory extends Document {
  name: string;
  description?: string;
  count?: number;
  subcategories: number;
  status?: string;
  isDefault?: boolean;
  isDeleted?: boolean;
  __v?: number;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    count: { type: Number, default: 0 },
    subcategories: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isDefault: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.isDeleted;
        delete ret.__v;
      },
    },
  }
);

export const Category = model<ICategory>("Category", CategorySchema);
