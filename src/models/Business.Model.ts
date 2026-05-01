import { Document, model, Schema } from "mongoose";

export interface IBusiness extends Document {
  name: string;
  slug: string;
  email: string;
  phone: string;
  password?: string;
  logo?: string;
  status: "active" | "suspended" | "pending";
  plan: "free" | "starter" | "growth" | "enterprise";
  isEmailVerified: boolean;
  twoFactorAuthentication: boolean;
  kycStatus?: "not-submitted" | "pending" | "verified" | "rejected";
  isDeleted: boolean;
  __v?: number;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    logo: { type: String },
    status: {
      type: String,
      enum: ["active", "suspended", "pending"],
      default: "pending",
    },
    plan: {
      type: String,
      enum: ["free", "starter", "growth", "enterprise"],
      default: "free",
    },
    isEmailVerified: { type: Boolean, default: false },
    twoFactorAuthentication: { type: Boolean, default: false },
    kycStatus: {
      type: String,
      enum: ["not-submitted", "pending", "verified", "rejected"],
      default: "not-submitted",
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete (ret as any)._id;
        delete ret.password;
        delete ret.__v;
        delete (ret as any).isDeleted;
      },
    },
  },
);

export const Business = model<IBusiness>("Business", BusinessSchema);
