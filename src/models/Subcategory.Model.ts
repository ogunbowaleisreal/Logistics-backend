import { Document, model, Schema } from "mongoose";

interface ISubcategory extends Document {
  name: string;
  category: Schema.Types.ObjectId;
  description?: string;
  count?: number;
  status?: string;
  isDefault?: boolean;
  isDeleted?: boolean;
  __v?: number;
}

const SubcategorySchema = new Schema<ISubcategory>(
  {
    name: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    description: { type: String },
    count: { type: Number, default: 0 },
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
        // delete ret.isDefault;
        delete ret.isDeleted;
        delete ret.__v;
      },
    },
  }
);

export const Subcategory = model<ISubcategory>(
  "Subcategory",
  SubcategorySchema
);
