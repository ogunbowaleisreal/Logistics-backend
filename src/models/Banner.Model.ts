import { Document, model, Schema } from "mongoose";

interface IBanner extends Document {
  text: string;
  image: string;
  link: string;
  status: string;
  isDefault: boolean;
  __v?: number;
}

const BannerSchema = new Schema<IBanner>(
  {
    text: { type: String },
    image: { type: String },
    link: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    isDefault: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

export const Banner = model<IBanner>("Banner", BannerSchema);
