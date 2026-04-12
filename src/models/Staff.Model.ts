import { Document, model, Schema } from "mongoose";

export interface IStaff extends Document {
  businessId: Schema.Types.ObjectId;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  password?: string;
  status: "active" | "suspended";
  avatar?: string;
  role: Schema.Types.ObjectId;
  twoFactorAuthentication: boolean;
  isDeleted: boolean;
  __v?: number;
}

const StaffSchema = new Schema<IStaff>(
  {
    businessId: { type: Schema.Types.ObjectId, ref: "Business", required: true },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    avatar: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7nG8OgXmMOXXiwbNOc-PPXUcilcIhCkS9BQ&usqp=CAU",
    },
    role: { type: Schema.Types.ObjectId, ref: "StaffRoles", required: true },
    twoFactorAuthentication: { type: Boolean, default: false },
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
  }
);

// Per-business uniqueness — same email/phone can exist across different businesses
StaffSchema.index({ businessId: 1, email: 1 }, { unique: true });
StaffSchema.index({ businessId: 1, phone: 1 }, { unique: true });

export const Staff = model<IStaff>("Staff", StaffSchema);
