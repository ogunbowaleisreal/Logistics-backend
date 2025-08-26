import { Document, model, Schema } from "mongoose";

export interface ITransaction extends Document {
  accountID: Schema.Types.ObjectId;
  type: string;
  points: number;
  status: string;
  __v?: number;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    accountID: { type: String, required: true },
    type: {
      type: String,
      enum: ["point-purchase", "ping", "item-reward"],
      required: true,
    },
    points: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "successful", "failed"],
      default: "pending",
    },
  },
  {
    discriminatorKey: "type",
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

export const Transaction = model<ITransaction>(
  "Transaction",
  TransactionSchema
);
