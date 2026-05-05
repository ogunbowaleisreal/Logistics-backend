import mongoose, { Document, Schema } from "mongoose";

export const StaffPermissions = [
  // Staff management
  { code: "CRTSTAFF", name: "CREATE STAFF" },
  { code: "UPTSTAFF", name: "UPDATE STAFF" },
  { code: "GETSTAFF", name: "GET STAFF" },
  { code: "DELSTAFF", name: "DELETE STAFF" },

  // Staff roles
  { code: "CRTSTFROLE", name: "CREATE STAFF ROLE" },
  { code: "UPTSTFROLE", name: "UPDATE STAFF ROLE" },
  { code: "GETSTFROLES", name: "GET STAFF ROLES" },

  // Orders
  { code: "GETORDERS", name: "GET ORDERS" },
  { code: "UPTORDER", name: "UPDATE ORDER STATUS" },

  // Riders
  { code: "CRTRIDER", name: "CREATE RIDER" },
  { code: "UPTRIDER", name: "UPDATE RIDER" },
  { code: "GETRIDERS", name: "GET RIDERS" },
  { code: "DELRIDER", name: "DELETE RIDER" },

  // Banks
  { code: "CRTBANK", name: "CREATE BANK" },
  { code: "GETBANKS", name: "GET BANKS" },
  { code: "DELBANK", name: "DELETE BANK" },

  // Banners
  { code: "CRTBANNER", name: "CREATE BANNER" },
  { code: "UPTBANNER", name: "UPDATE BANNER" },
  { code: "GETBANNERS", name: "GET BANNERS" },
  { code: "DELBANNER", name: "DELETE BANNER" },

  // FAQ
  { code: "CRTFAQ", name: "CREATE FAQ" },
  { code: "UPTFAQ", name: "UPDATE FAQ" },
  { code: "GETFAQS", name: "GET FAQS" },
  { code: "DELFAQ", name: "DELETE FAQ" },

  // Configuration
  { code: "GETCFG", name: "GET CONFIGURATION" },
  { code: "UPTCFG", name: "UPDATE CONFIGURATION" },

  // Themes
  { code: "CRTTHEME", name: "CREATE THEME" },
  { code: "UPTTHEME", name: "UPDATE THEME" },
  { code: "GETTHEMES", name: "GET THEMES" },
  { code: "DELTHEME", name: "DELETE THEME" },

  // Business profile
  { code: "GETBIZPROFILE", name: "GET BUSINESS PROFILE" },
  { code: "UPTBIZPROFILE", name: "UPDATE BUSINESS PROFILE" },
];

export interface IStaffRole extends Document {
  businessId: Schema.Types.ObjectId;
  title: string;
  permissions: string[];
  staffCount: number;
  status: "active" | "suspended";
  __v?: number;
}

const StaffRoleSchema = new Schema<IStaffRole>(
  {
    businessId: {
      type: Schema.Types.ObjectId,
      ref: "Business",
      required: true,
    },
    title: { type: String, required: true },
    permissions: { type: [String], required: true },
    staffCount: { type: Number, default: 0 },
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

// Two businesses can both have a role called "Manager"
StaffRoleSchema.index({ businessId: 1, title: 1 }, { unique: true });

export const StaffRole = mongoose.model<IStaffRole>(
  "StaffRoles",
  StaffRoleSchema,
);
