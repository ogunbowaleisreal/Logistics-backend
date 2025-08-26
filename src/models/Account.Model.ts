import { model, Schema, Document } from "mongoose";

interface IAccount extends Document {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phone: string;
  password?: string;
  address?: {
    city?: string;
    state?: string;
  };
  avatar?: string;
  gender?: string;
  dob?: Date;
  referral?: string;
  referralCode: string;
  isVerified?: boolean;
  status?: string;
  points: number;
  fcmToken?: string;
  isDeleted?: boolean;
  __v?: number;
}

const AccountSchema = new Schema<IAccount>(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String},
    address: {
      city: { type: String },
      state: { type: String },
    },
    avatar: { type: String, sparse: true },
    gender: { type: String, enum: ["male", "female"], sparse: true },
    dob: { type: Date, sparse: true },
    referral: { type: String },
    referralCode: { type: String },
    isVerified: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    points: { type: Number, default: 0, min: 0 },
    fcmToken: { type: String, sparse: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.isDeleted;
      },
    },
  }
);

export const Account = model<IAccount>("Account", AccountSchema);
