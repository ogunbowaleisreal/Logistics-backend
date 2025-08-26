import mongoose, { Document, Schema, model } from "mongoose";

export interface IAdmin extends Document {
  firstname: string;
  lastname: string;
  email: string;
  password?: string;
  phone: string;
  status?: string;
  avatar?: string;
  role?: Schema.Types.ObjectId;
  twoFactorAuthentication?: boolean;
  __v?: number;
}

const AdminSchema = new Schema<IAdmin>(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    avatar: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7nG8OgXmMOXXiwbNOc-PPXUcilcIhCkS9BQ&usqp=CAU",
    },
    role: { type: Schema.Types.ObjectId, ref: "Roles", required: true },
    twoFactorAuthentication: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);

export const Admin = model<IAdmin>("Admins", AdminSchema);
