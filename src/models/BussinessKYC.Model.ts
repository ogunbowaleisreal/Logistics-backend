import { Document, model, Schema } from "mongoose";

export interface IBusinessKYC extends Document {
  businessId: Schema.Types.ObjectId;
  registrationNumber: string;
  address: string;
  identification: {
    type: "nin" | "driver-license" | "international-passport" | "voters-card";
    document: string;
    status: "pending" | "verified" | "rejected";
    rejectionReason?: string;
  };
  cac: {
    document: string;
    status: "pending" | "verified" | "rejected";
    rejectionReason?: string;
  };
  bvn: {
    /** Encrypted BVN number string */
    document: string;
    status: "pending" | "verified" | "rejected";
  };
  isDeleted: boolean;
  __v?: number;
}

const BusinessKYCSchema = new Schema<IBusinessKYC>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    registrationNumber: { type: String },
    address: { type: String },
    identification: {
      type: {
        type: String,
        enum: [
          "nin",
          "driver-license",
          "international-passport",
          "voters-card",
        ],
      },
      document: { type: String },
      status: { type: String, enum: ["pending", "verified", "rejected"] },
      rejectionReason: { type: String },
    },
    cac: {
      document: { type: String },
      status: { type: String, enum: ["pending", "verified", "rejected"] },
      rejectionReason: { type: String },
    },
    bvn: {
      document: { type: String },
      status: { type: String, enum: ["pending", "verified", "rejected"] },
    },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete (ret as any)._id;
        delete ret.__v;
        delete (ret as any).isDeleted;
      },
    },
  },
);

export const BusinessKYC = model<IBusinessKYC>(
  "BusinessKYC",
  BusinessKYCSchema,
);
