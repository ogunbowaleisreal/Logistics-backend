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
  { code: "GETBUSINESS", name: "GET BUSINESSES" },
  { code: "UPTBUSINESS", name: "UPDATE BUSINESS STATUS" },
  { code: "DELBUSINESS", name: "DELETE BUSINESS" },

  // Announcement
  { code: "CREATEANNOUNCEMENT", name: "CREATE ANNOUNCEMENT" },
  { code: "GETANNOUNCEMENT", name: "GET ANNOUNCEMENTS" },
  { code: "SENDANNOUNCEMENT", name: "SEND ANNOUNCEMENT" },
  { code: "RESENDANNOUNCEMENT", name: "RESEND ANNOUNCEMENT" },
  { code: "DELANNOUNCEMENT", name: "DELETE ANNOUNCEMENT" },
  { code: "UPDATEANNOUNCEMENT", name: "UPDATE ANNOUNCEMENT" },

  // Global Shipping Zones
  { code: "CRTGBLZONE", name: "CREATE GLOBAL SHIPPING ZONE" },
  { code: "GETGBLZONE", name: "GET GLOBAL SHIPPING ZONES" },
  { code: "UPTGBLZONE", name: "UPDATE GLOBAL SHIPPING ZONE" },
  { code: "DELGBLZONE", name: "DELETE GLOBAL SHIPPING ZONE" },
  { code: "GETGBLBRACKET", name: "GET GLOBAL WEIGHT BRACKETS" },
  { code: "UPTGBLBRACKET", name: "CREATE OR UPDATE GLOBAL WEIGHT BRACKET" },
  { code: "DELGBLBRACKET", name: "DELETE GLOBAL WEIGHT BRACKET" },

  //Platform Configuration
  { code: "GETPLATFORMCFG", name: "GET PLATFORM CONFIGURATION" },
  { code: "UPTPLATFORMCFG", name: "UPDATE PLATFORM CONFIGURATION" },
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
        delete (ret as any)._id;
        delete ret.__v;
      },
    },
  },
);

export const Role = mongoose.model<IRole>("Roles", RoleSchema);
