import { Document, model, Schema } from "mongoose";

export interface IPlatformConfig extends Document {
    key: string; // singleton — always "global"
    announcementRates: {
        smsRate: number;   // ₦ cost per SMS
        emailRate: number; // ₦ cost per email
    };
    createdAt: Date;
    updatedAt: Date;
}

const PlatformConfigSchema = new Schema<IPlatformConfig>(
    {
        key: { type: String, required: true, unique: true, default: "global" },
        announcementRates: {
            smsRate: { type: Number, required: true, default: 4 },
            emailRate: { type: Number, required: true, default: 1 },
        },
    },
    { timestamps: true },
);

export const PlatformConfig = model<IPlatformConfig>(
    "PlatformConfig",
    PlatformConfigSchema,
);