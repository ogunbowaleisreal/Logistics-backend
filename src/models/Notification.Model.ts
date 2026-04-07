import { model, Schema, Document } from "mongoose";

interface INotificationGroup extends Document {
  name: string;
  accounts: string[];
  size: number;
  __v?: number;
}

const NotificationGroupSchema = new Schema<INotificationGroup>(
  {
    name: { type: String, required: true, unique: true },
    accounts: [{ type: String }],
    size: { type: Number },
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

export const NotificationGroup = model<INotificationGroup>(
  "NotificationGroups",
  NotificationGroupSchema
);

interface INotification extends Document {
  title?: string;
  body: string;
  type: string[];
  recipientType: string;
  recipientCount: number;
  groupID?: Schema.Types.ObjectId;
  __v?: number;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String },
    body: { type: String, required: true },
    type: [{ type: String, enum: ["email", "push", "in-app"] }],
    recipientType: {
      type: String,
      enum: ["all", "verified", "specific"],
      default: "all",
    },
    recipientCount: { type: Number, default: 0 },
    groupID: { type: Schema.Types.ObjectId, ref: "NotificationGroups" },
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

export const Notifications = model<INotification>(
  "Notifications",
  NotificationSchema
);

interface IUserInAppNotification extends Document {
  accountID: Schema.Types.ObjectId;
  title: string;
  body: string;
  status: string;
  __v?: number;
}

const UserInAppNotificationSchema = new Schema<IUserInAppNotification>(
  {
    accountID: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    title: { type: String },
    body: { type: String, required: true },
    status: { type: String, enum: ["delivered", "read"], default: "delivered" },
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

export const UserInAppNotifications = model<IUserInAppNotification>(
  "UserInAppNotifications",
  UserInAppNotificationSchema
);
