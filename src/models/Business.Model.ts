import { Document, model, Schema } from "mongoose";

export interface IBusiness extends Document {
  name: string;
  username?: string;
  slug?: string;
  email: string;
  phone?: string;
  password?: string;
  about?: string;
  authProvider?: "local" | "google";
  googleUid?: string;
  isProfileComplete?: boolean;
  logo?: string;
  status: "active" | "suspended" | "pending";
  // plan: "free" | "starter" | "growth" | "enterprise";
  isEmailVerified: boolean;
  twoFactorAuthentication: boolean;
  kycStatus?: "not-submitted" | "pending" | "verified" | "rejected";
  wallet: {
    naira: number;
  };
  socialLinks: {
    instagram: string;
    facebook: string;
    tiktok: string;
    googlePlus: string;
    linkedIn: string;
    x: string;
  };
  supports: {
    phone: {
      value: string;
      isEnabled: boolean;
    };
    email: {
      value: string;
      isEnabled: boolean;
    };
    whatsapp: {
      value: string;
      isEnabled: boolean;
    };
  };
  isDeleted: boolean;
  __v?: number;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    name: { type: String, required: true },
    username: { type: String, unique: true, sparse: true },
    slug: { type: String, unique: true, sparse: true, index: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleUid: { type: String, unique: true, sparse: true },
    isProfileComplete: { type: Boolean, default: true },
    logo: { type: String, default: null },
    about: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "suspended", "pending"],
      default: "pending",
    },
    // plan: {
    //   type: String,
    //   enum: ["free", "starter", "growth", "enterprise"],
    //   default: "free",
    // },
    isEmailVerified: { type: Boolean, default: false },
    twoFactorAuthentication: { type: Boolean, default: false },
    kycStatus: {
      type: String,
      enum: ["not-submitted", "pending", "verified", "rejected"],
      default: "not-submitted",
    },
    wallet: {
      naira: { type: Number, default: 0 },
    },
    socialLinks: {
      instagram: { type: String, default: "" },
      facebook: { type: String, default: "" },
      tiktok: { type: String, default: "" },
      googlePlus: { type: String, default: "" },
      linkedIn: { type: String, default: "" },
      x: { type: String, default: "" },
    },
    supports: {
      phone: {
        value: { type: String },
        isEnabled: { type: Boolean, default: false },
      },
      email: {
        value: { type: String },
        isEnabled: { type: Boolean, default: false },
      },
      whatsapp: {
        value: { type: String },
        isEnabled: { type: Boolean, default: false },
      },
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
