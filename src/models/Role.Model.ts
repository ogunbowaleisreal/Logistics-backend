import mongoose, { Document, Schema } from "mongoose";

export const Permissions = [
  // Role
  { code: "CRTROLE", name: "CREATE ROLE" },
  { code: "UPTROLES", name: "UPDATE ROLE" },

  // Admin
  { code: "CRTADMIN", name: "CREATE ADMIN" },
  { code: "UPTADMIN", name: "UPDATE ADMIN" },
  { code: "GETADMINS", name: "GET ADMINS" },
  { code: "DELADMIN", name: "DELETE ADMIN" },

  // Agent
  { code: "GETUSERS", name: "GET USERS" },
  { code: "UPTUSER", name: "UPDATE USER" },

  // Bonus
  { code: "GETCONFIG", name: "GET CONFIGURATION" },
  { code: "UPTCONFIG", name: "UPDATE CONFIGURATION" },
];

// Interface for the Role document
interface IRole extends Document {
  title: string;
  permissions: any;
  admins: number;
  status?: string;
  __v?: number;
}

const RoleSchema = new Schema<IRole>(
  {
    title: { type: String, required: true, unique: true },
    permissions: { type: Array, required: true },
    admins: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
  },
  {
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

export const Role = mongoose.model<IRole>("Roles", RoleSchema);
