import { Document, model, Schema } from "mongoose";

interface IFAQ extends Document {
  businessId?: Schema.Types.ObjectId;
  tag?: string;
  question: string;
  answer: string;
  __v?: number;
}

const FAQSchema = new Schema<IFAQ>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      index: true,
      required: false,
    },
    tag: { type: String },
    question: { type: String },
    answer: { type: String },
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

export const FAQ = model("FAQ", FAQSchema);
