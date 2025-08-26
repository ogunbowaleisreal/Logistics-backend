// import admin from "firebase-admin";
// import {
//   NotificationGroup,
//   Notifications,
//   UserInAppNotifications,
// } from "../models/Notification.Model";
// import AppError from "../utilities/ErrorHandler";
// import { paginateModel } from "../utilities/Pagination.Helper";
// import { Account } from "../models/Account.Model";

// export class NotificationService {
//   /////////////////////////////// ACCOUNT NOTIFICATION /////////////////////////
 

//   /////////////////////////////// NOTIFICATION GROUP /////////////////////////
//   public async createNotificationGroup(payload: any) {
//     const { name, accounts } = payload;

//     const groupExistence = await NotificationGroup.findOne({
//       groupName: name.toUpperCase(),
//     });

//     if (groupExistence) {
//       throw new AppError(400, "Notification group already exist");
//     }

//     const validAccounts = await this.verifyGroupAccounts(accounts);

//     const groupSize = validAccounts.length;
//     const group = await NotificationGroup.create({
//       groupName: name.toUpperCase(),
//       Accounts: validAccounts,
//       groupSize,
//     });

//     return group;
//   }

//   public async getNotificationGroups(filter: any) {
//     const { name } = filter;

//     if (name) {
//       const group = await NotificationGroup.findOne({
//         groupName: name.toUpperCase(),
//       });
//       if (!group) {
//         throw new AppError(404, "Group not found!");
//       }
//       return group;
//     }

//     const groups = await NotificationGroup.find();
//     return groups;
//   }

//   public async updateNotificationGroup(payload: any) {
//     const { groupID, name, accounts } = payload;

//     const group = await NotificationGroup.findOne({ groupID });
//     if (!group) {
//       throw new AppError(404, "Group not found!");
//     }

//     if (name) {
//       group.groupName = name.toUpperCase();
//     }

//     if (accounts) {
//       const validAccounts = await this.verifyGroupAccounts(accounts);
//       group.accounts = validAccounts;
//       group.groupSize = validAccounts.length;
//     }

//     const updateGroup = await group.save();
//     return updateGroup;
//   }

//   public async deleteNotificationGroup(name: string) {
//     const group = await NotificationGroup.findOneAndDelete({
//       groupName: name.toUpperCase(),
//     });

//     if (!group) {
//       throw new AppError(404, "Group not found!");
//     }
//     return "Group deleted successfully";
//   }

//   /////////////////////////////// NOTIFICATION ///////////////////////////////
//   public async createNotification(payload: any) {
//     const { type, title, body, recipient } = payload;

//     // Verify Group
//     const recipients = await this.verifyGroup(recipient);

//     let notification;
//     if (type == "in-app") {
//       notification = await Notifications.create({
//         title,
//         body,
//         type: "in-app",
//         recipients,
//       });
//     } else if (type == "alert") {
//       notification = await Notifications.create({
//         body,
//         type: "alert",
//         recipients,
//       });
//     } else {
//       throw new AppError(400, "Invalid notification type passed!");
//     }

//     return notification;
//   }

//   public async getNotifications(filter: any) {
//     const { notificationID, type, page, limit } = filter;

//     if (notificationID) {
//       const notification = await Notifications.findOne({
//         _id: notificationID,
//       });
//       if (!notification) {
//         throw new AppError(404, "Notification not found!");
//       }
//       return notification;
//     }
//     const query: any = {};
//     if (type) {
//       query.type = type;
//     }
//     const notifications = await paginateModel(
//       Notifications,
//       query,
//       page,
//       limit
//     );
//     return notifications;
//   }

//   public async deleteNotification(notificationID: string) {
//     const notification = await Notifications.findOneAndDelete({
//       _id: notificationID,
//     });
//     if (!notification) {
//       throw new AppError(404, "Notification not found!");
//     }

//     return "Notification has been deleted!";
//   }

//   public async sendNotification(notificationID: string) {
//     const notification = await Notifications.findOne({ _id: notificationID });
//     if (!notification) {
//       throw new AppError(404, "Notification template not found!");
//     }
//     const { type, title, body, recipients } = notification;

//     if (type === "in-app") {
//       await this.createUserInAppNotification(recipients, title!, body);
//     } else {
//       await this.createUserAlertNotification(recipients, body);
//     }
//     return "Notification Sent Successfully";
//   }

//   /////////////////////////////// USER NOTIFICATION //////////////////////////////////
//   private async createUserInAppNotification(
//     recipients: string,
//     title: string,
//     body: string
//   ) {
//     let accounts: any;
//     if (recipients === "ALL-USERS") {
//       accounts = await Account.find().select("_id");
//     } else if (recipients === "VERIFIED-USERS") {
//       accounts = await Account.find({ status: "active" }).select(
//         "_id"
//       );
//     } else if (recipients === "UNVERIFIED-USERS") {
//       accounts = await Account.find({ status: "inactive" }).select(
//         "_id"
//       );
//     } else {
//       accounts = await NotificationGroup.findOne({
//         groupName: recipients,
//       }).select("-_id accounts");
//     }

//     const batchSize = 100;
//     const recipientSize = accounts.length;
//     const batches = [];
//     const notificationSchemas = [];

//     // Create Notification Schema
//     for (var i = 0; i < recipientSize; i += 1) {
//       // const userNotificationID =
//       // 	new UniqueIDGenerator().generateInAppNotificationID();
//       const notificationSchema = {
//         accountID: accounts[i]["accountID"],
//         title,
//         body,
//       };

//       notificationSchemas.push(notificationSchema);
//     }

//     // Create Notification Batches
//     for (var i = 0; i < recipientSize; i += batchSize) {
//       batches.push(notificationSchemas.slice(i, i + batchSize));
//     }

//     // Insert Notification Batch
//     for (const batch of batches) {
//       await UserInAppNotifications.insertMany(batch);
//     }
//     return;
//   }

//   private async createUserAlertNotification(recipients: string, body: string) {
//     const serviceAccountKey = require("../../../serviceAccountKey.json");

//     admin.initializeApp({
//       credential: admin.credential.cert(serviceAccountKey),
//     });

//     let fcmTokens: any;
//     let pipeline: any;
//     let query: any;
//     if (recipients === "ALL-USERS") {
//       pipeline = [
//         {
//           $group: {
//             _id: null,
//             fcmToken: { $push: "$fcmToken" },
//           },
//         },
//         {
//           $project: {
//             _id: 0,
//             fcmToken: 1,
//           },
//         },
//       ];
//       query = await Account.aggregate(pipeline);
//       fcmTokens = query[0]["fcmToken"];
//     } else if (recipients === "VERIFIED-USERS") {
//       pipeline = [
//         {
//           $match: {
//             status: "active",
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             fcmToken: { $push: "$fcmToken" },
//           },
//         },
//         {
//           $project: {
//             _id: 0,
//             fcmToken: 1,
//           },
//         },
//       ];
//       query = await Account.aggregate(pipeline);
//       console.log(query);
//       fcmTokens = query[0]["fcmToken"];
//     } else if (recipients === "UNVERIFIED-USERS") {
//       pipeline = [
//         {
//           $match: {
//             status: "inactive",
//           },
//         },
//         {
//           $group: {
//             _id: null,
//             fcmToken: { $push: "$fcmToken" },
//           },
//         },
//         {
//           $project: {
//             _id: 0,
//             fcmToken: 1,
//           },
//         },
//       ];
//       query = await Account.aggregate(pipeline);
//       fcmTokens = query[0]["fcmToken"];
//     } else {
//       const notificationGroup = await NotificationGroup.findOne({
//         groupName: recipients,
//       }).select("-_id Accounts");
//       if (!notificationGroup)
//         throw new AppError(404, "Notification group not found!");

//       fcmTokens = await this.getGroupAccountFCMToken(
//         notificationGroup.accounts
//       );
//     }

//     const batches = [];
//     const batchSize = 100;
//     const recipientSize = fcmTokens.length;

//     const message: any = {
//       webpush: {
//         notification: {
//           body,
//         },
//       },
//     };

//     for (let i = 0; i < recipientSize; i += batchSize) {
//       const batchTokens = fcmTokens.slice(i, i + batchSize);
//       const batchMessage = { ...message };
//       batchMessage.tokens = batchTokens;
//       batches.push(batchMessage);
//     }

//     // Send batches of notifications
//     for (const batch of batches) {
//       admin
//         .messaging()
//         .sendMulticast(batch)
//         .then((response) => {
//           console.log("Batch Notification sent successfully:", response);
//         })
//         .catch((error) => {
//           console.error("Error sending batch notification:", error);
//         });
//     }
//   }

//   /////////////////////////////// Helpers /////////////////////////////////////////////
//   private async verifyGroup(name: string) {
//     if (name.toUpperCase() === "ALL-USERS") {
//       return "ALL-USERS";
//     } else if (name.toUpperCase() === "VERIFIED-USERS") {
//       return "VERIFIED-USERS";
//     } else if (name.toUpperCase() === "UNVERIFIED-USERS") {
//       return "UNVERIFIED-USERS";
//     } else {
//       const group = await NotificationGroup.findOne({
//         groupName: name.toUpperCase(),
//       });
//       if (!group) {
//         throw new AppError(400, "Invalid group ID");
//       }
//       return group.groupName;
//     }
//   }

//   private async getGroupAccounts(name: string) {
//     const group = await NotificationGroup.findOne({
//       groupName: name.toUpperCase(),
//     });
//     if (!group) {
//       throw new AppError(404, "Group not found!");
//     }
//     return group.accounts;
//   }

//   private async verifyGroupAccounts(accounts: string[]) {
//     const validAccounts = [];
//     for (var account of accounts) {
//       const verifiedAccount = await Account.findOne({ _id: account });
//       if (!verifiedAccount) continue;
//       validAccounts.push(Account);
//     }

//     if (validAccounts.length === 0) {
//       throw new AppError(400, "No valid Account found!");
//     }
//     return validAccounts;
//   }

//   private async getGroupAccountFCMToken(accounts: string[]) {
//     const availableFCMToken = [];
//     for (var account of accounts) {
//       const token = await Account.findOne({ _id: account }).select(
//         "fcmToken"
//       );
//       if (!token || !token.fcmToken || token.fcmToken != "") {
//         continue;
//       }
//       availableFCMToken.push(token.fcmToken);
//     }
//     return availableFCMToken;
//   }
// }
