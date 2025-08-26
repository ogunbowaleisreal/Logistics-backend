import { Document, model, Schema } from "mongoose";

interface ITheme extends Document {
  font: string;
  color: string;
  isDeleted?: boolean;
  __v?: number;
}

const ThemeSchema = new Schema<ITheme>(
  {
    font: { type: String, required: true },
    color: { type: String, required: true },
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

export const Theme = model<ITheme>("Theme", ThemeSchema);
