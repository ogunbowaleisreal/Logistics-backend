import { Document, model, Schema } from "mongoose";

interface IFAQCategory extends Document {
  name: string;
  status: string;
  __v?: number;
}

const FAQCategorySchema = new Schema<IFAQCategory>(
  {
    name: { type: String, required: true },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
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
  }
);

export const FAQCategory = model("FAQCategory", FAQCategorySchema);

interface IFAQ extends Document {
  category: Schema.Types.ObjectId;
  question: string;
  answer: string;
  __v?: number;
}

const FAQSchema = new Schema<IFAQ>(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: "FAQCategory",
      required: true,
    },
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
  }
);

export const FAQ = model("FAQ", FAQSchema);
