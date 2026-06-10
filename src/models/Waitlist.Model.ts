import { Document, model, Schema } from "mongoose";

export interface IWaitlist extends Document {
  fullName: string;
  businessName: string;
  phone: string;
  email?: string;
}

const WaitlistSchema = new Schema<IWaitlist>(
  {
    fullName: { type: String, required: true, trim: true },
    businessName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, sparse: true, unique: true, trim: true, lowercase: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete (ret as any)._id;
        delete (ret as any).__v;
      },
    },
  },
);

export const Waitlist = model<IWaitlist>("Waitlist", WaitlistSchema);
