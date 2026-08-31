import { Schema, model, Document, Types } from "mongoose";

export interface IAnnouncement extends Document {
    _id: Types.ObjectId;
    title: string;
    message: string;

    channel: "email" | "sms" | "push" | "inapp";

    audience:
    | "all_businesses"
    | "active_businesses"
    | "suspended_businesses"
    | "pending_businesses"
    | "verified_email_businesses"
    | "unverified_email_businesses"
    | "kyc_verified_businesses"
    | "customers"
    | "specific"
    | "specific_customers";

    status: "pending" | "ongoing" | "successful" | "failed";

    sentCount: number;
    failedCount: number;
    specificBusinesses: Types.ObjectId[];
    customerType?: "sender" | "receiver" | "both";
    specificCustomers?: { orderId: Types.ObjectId; type: "sender" | "receiver" }[];
    announcementStartAt: Date;

    // NEW — creator + business scoping
    creatorType: "admin" | "business";
    createdByModel: "Admin" | "Staff" | "Business";
    createdBy: Types.ObjectId;
    businessId?: Types.ObjectId;
    estimatedCost: number;
    actualCost: number;

    lastSentAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncement>(
    {
        title: { type: String, required: true },
        message: { type: String, required: true },

        channel: {
            type: String,
            enum: ["email", "sms", "push", "inapp"],
            required: true,
        },

        audience: {
            type: String,
            enum: [
                "all_businesses",
                "active_businesses",
                "suspended_businesses",
                "pending_businesses",
                "verified_email_businesses",
                "unverified_email_businesses",
                "kyc_verified_businesses",
                "customers",
                "specific",
                "specific_customers",
            ],
            required: true,
        },

        status: {
            type: String,
            enum: ["pending", "ongoing", "successful", "failed"],
            default: "pending",
        },

        specificBusinesses: [{ type: Schema.Types.ObjectId, ref: "Business" }],

        customerType: {
            type: String,
            enum: ["sender", "receiver", "both"],
        },

        specificCustomers: [
            {
                orderId: { type: Schema.Types.ObjectId, ref: "Order" },
                type: { type: String, enum: ["sender", "receiver"] },
            },
        ],

        announcementStartAt: { type: Date },

        // NEW
        creatorType: {
            type: String,
            enum: ["admin", "business"],
            required: true,
            default: "admin",
        },
        createdByModel: {
            type: String,
            enum: ["Admin", "Staff", "Business"],
            required: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            required: true,
            refPath: "createdByModel",
        },
        businessId: {
            type: Schema.Types.ObjectId,
            ref: "Business",
        },
        estimatedCost: { type: Number, default: 0 },
        actualCost: { type: Number, default: 0 },

        sentCount: { type: Number, default: 0 },
        failedCount: { type: Number, default: 0 },
        lastSentAt: Date,
    },
    { timestamps: true },
);

export const Announcement = model<IAnnouncement>("Announcement", AnnouncementSchema);


// import { Schema, model, Document, Types } from "mongoose";

// export interface IAnnouncement extends Document {
//     _id: Types.ObjectId;
//     title: string;
//     message: string;

//     channel: "email" | "sms" | "push" | "inapp";

//     audience:
//     | "all_businesses"
//     | "active_businesses"
//     | "suspended_businesses"
//     | "pending_businesses"
//     | "verified_email_businesses"
//     | "unverified_email_businesses"
//     | "kyc_verified_businesses"
//     | "customers"
//     | "specific"
//     | "specific_customers";

//     customerType?: "sender" | "receiver" | "both";

//     // NEW — only meaningful when audience === "specific_customers"
//     specificCustomers?: {
//         orderId: Types.ObjectId;
//         type: "sender" | "receiver";
//     }[];
//     status:
//     | "pending"
//     | "ongoing"
//     | "successful"
//     | "failed";

//     sentCount: number;
//     failedCount: number;
//     specificBusinesses: Types.ObjectId[];
//     announcementStartAt: Date;
//     createdBy: Types.ObjectId;

//     lastSentAt?: Date;

//     createdAt: Date;
//     updatedAt: Date;
// }

// const AnnouncementSchema = new Schema<IAnnouncement>(
//     {
//         title: {
//             type: String,
//             required: true,
//         },

//         message: {
//             type: String,
//             required: true,
//         },

//         channel: {
//             type: String,
//             enum: ["email", "sms", "push", "inapp"],
//             required: true,
//         },

//         audience: {
//             type: String,
//             enum: [
//                 "all_businesses",
//                 "active_businesses",
//                 "suspended_businesses",
//                 "pending_businesses",
//                 "verified_email_businesses",
//                 "unverified_email_businesses",
//                 "kyc_verified_businesses",
//                 "customers",
//                 "specific",
//                 "specific_customers"
//             ],
//             required: true,
//         },
//         customerType: {
//             type: String,
//             enum: ["sender", "receiver", "both"],
//         },
//         specificCustomers: [
//             {
//                 orderId: { type: Schema.Types.ObjectId, ref: "Order" },
//                 type: { type: String, enum: ["sender", "receiver"] },
//             },
//         ],

//         status: {
//             type: String,
//             enum: [
//                 "pending",
//                 "ongoing",
//                 "successful",
//                 "failed",
//             ],
//             default: "pending",
//         },

//         specificBusinesses: [
//             {
//                 type: Schema.Types.ObjectId,
//                 ref: "Business",
//             },
//         ],

//         announcementStartAt: {
//             type: Date,
//         },

//         sentCount: {
//             type: Number,
//             default: 0,
//         },

//         failedCount: {
//             type: Number,
//             default: 0,
//         },

//         createdBy: {
//             type: Schema.Types.ObjectId,
//             ref: "Admins",
//             required: true,
//         },

//         lastSentAt: Date,
//     },
//     {
//         timestamps: true,
//     }
// );

// export const Announcement = model<IAnnouncement>(
//     "Announcement",
//     AnnouncementSchema
// );