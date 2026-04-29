import { Document, model, Schema } from "mongoose";

interface ITheme extends Document {
  businessId: Schema.Types.ObjectId;
  font: string;
  color: string;
  logo: string;
  isDeleted?: boolean;
  __v?: number;
}

const ThemeSchema = new Schema<ITheme>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      index: true,
      required: true,
    },
    font: { type: String, required: true },
    color: { type: String, required: true },
    logo: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete (ret as any)._id;
        delete ret.__v;
        delete ret.isDeleted;
      },
    },
  },
);

export const Theme = model<ITheme>("Theme", ThemeSchema);
