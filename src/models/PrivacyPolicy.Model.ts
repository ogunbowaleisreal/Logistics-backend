import { Document, model, Schema } from "mongoose";

interface IPrivacyPolicy extends Document {
  businessId?: Schema.Types.ObjectId;
  body: string;
  __v?: number;
}

const PrivacyPolicySchema = new Schema<IPrivacyPolicy>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      index: true,
      required: false,
    },
    body: { type: String },
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

export const PrivacyPolicy = model<IPrivacyPolicy>(
  "PrivacyPolicy",
  PrivacyPolicySchema,
);
