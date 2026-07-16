import { Document, model, Schema } from "mongoose";

export interface IWithdrawal extends Document {
  businessId: Schema.Types.ObjectId;
  bankId?: Schema.Types.ObjectId;
  amount: number;
  reference: string;
  status: "pending" | "processed" | "successful" | "failed" | "reversed";
  bankSnapshot: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
  };
  sessionId?: string;
  __v?: number;
}

const WithdrawalSchema = new Schema<IWithdrawal>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    bankId: {
      type: Schema.Types.ObjectId,
      ref: "Bank",
      required: false,
    },
    amount: { type: Number, required: true },
    reference: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "processed", "successful", "failed", "reversed"],
      default: "pending",
    },
    bankSnapshot: {
      accountName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      bankName: { type: String, required: true },
      bankCode: { type: String, required: true },
    },
    sessionId: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete (ret as any)._id;
        delete ret.__v;
      },
    },
  },
);

WithdrawalSchema.index({ businessId: 1, createdAt: -1 });

export const Withdrawal = model<IWithdrawal>("Withdrawal", WithdrawalSchema);
