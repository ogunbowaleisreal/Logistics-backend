import { Document, model, Schema } from "mongoose";

interface IBank extends Document {
  name: string;
  accountName: string;
  accountNumber: string;
  status: string;
  isDefault: boolean;
  isDeleted?: boolean;
  __v?: number;
}

const BankSchema = new Schema<IBank>(
  {
    name: { type: String, required: true },
    accountName: { type: String, required: true },
    accountNumber: { type: String, required: true },
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
        delete ret.__v;
        delete ret.isDeleted;
      },
    },
  }
);

export const Bank = model<IBank>("Bank", BankSchema);
