// import { Account } from "../../models/Account.Model";
// import {
//   NotificationGroup,
//   Notifications,
// } from "../../models/Notification.Model";
// import AppError from "../../utilities/ErrorHandler";
// import { paginateModel } from "../../utilities/Pagination.Helper";

// export class NotificationGroupService {
//   public async createNotificationGroup(payload: any) {
//     const { name, accounts } = payload;

//     const groupExistence = await NotificationGroup.findOne({
//       name: name.toUpperCase(),
//     });

//     if (groupExistence) {
//       throw new AppError(400, "Notification group already exist");
//     }

//     const validAccounts = await this.verifyGroupAccounts(accounts);

//     const size = validAccounts.length;
//     const group = await NotificationGroup.create({
//       name: name.toUpperCase(),
//       accounts: validAccounts,
//       size,
//     });

//     return group;
//   }

//   public async getNotificationGroups(filter: any) {
//     const { groupID, name } = filter;

//     if (groupID) {
//       const group = await NotificationGroup.findOne({ _id: groupID });
//       if (!group) {
//         throw new AppError(404, "Group not found!");
//       }
//       return group;
//     }
//     if (name) {
//       const group = await NotificationGroup.findOne({
//         name: name.toUpperCase(),
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

//     const group: any = await NotificationGroup.findOne({ _id: groupID });
//     if (!group) {
//       throw new AppError(404, "Group not found!");
//     }

//     if (name) {
//       group.name = name.toUpperCase();
//     }

//     if (accounts) {
//       const validAccounts = await this.verifyGroupAccounts(accounts);
//       group.accounts = validAccounts;
//       group.size = validAccounts.length;
//     }

//     const updateGroup = await group.save();
//     return updateGroup;
//   }

//   public async deleteNotificationGroup(groupID: string) {
//     const group = await NotificationGroup.findOneAndDelete({
//       _id: groupID,
//     });

//     if (!group) {
//       throw new AppError(404, "Group not found!");
//     }
//     return;
//   }

//   private async verifyGroupAccounts(accounts: string[]) {
//     // const validAccounts = [];
//     const validAccounts = await Account.find({ _id: accounts });
//     if (validAccounts.length === 0) {
//       throw new AppError(400, "No valid Account found!");
//     }

//     return validAccounts.map((account) => account._id);
//   }
// }

// export class NotificationService {
//   public async createNotification(payload: any) {
//     const { title, body, type, recipientType, groupID } = payload;
//     let notification;
//     if (recipientType == "all") {
//       notification = await Notifications.create({
//         title,
//         body,
//         type,
//         recipientType,
//         recipientCount: await Account.countDocuments({ isDeleted: false }),
//       });
//     } else if (recipientType == "verified") {
//       notification = await Notifications.create({
//         title,
//         body,
//         type,
//         recipientType,
//         recipientCount: await Account.countDocuments({
//           isVerified: true,
//           isDeleted: false,
//         }),
//       });
//     } else if (recipientType == "specific") {
//       if (!groupID) {
//         throw new AppError(
//           400,
//           "Group ID is required for specific recipient type"
//         );
//       }
//       const group = await NotificationGroup.findOne({
//         _id: groupID,
//       });
//       if (!group) {
//         throw new AppError(404, "Notification group not found!");
//       }
//       notification = await Notifications.create({
//         title,
//         body,
//         type,
//         recipientType,
//         recipientCount: group.size,
//         groupID,
//       });
//     }

//     return notification;
//   }

//   public async getNotifications(filter: any) {
//     const { notificationID, search, type, page, limit } = filter;

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
//     if (search) {
//       query.$or = [
//         { title: { $regex: search, $options: "i" } },
//         { body: { $regex: search, $options: "i" } },
//       ];
//     }
//     const notifications = await paginateModel(
//       Notifications,
//       query,
//       page,
//       limit
//     );
//     return notifications;
//   }

//   public async updateNotification(payload: any) {
//     const { notificationID, ...rest } = payload;
//     if (rest.recipientType == "all") {
//       rest.recipientCount = await Account.countDocuments({ isDeleted: false });
//     } else if (rest.recipientType == "verified") {
//       rest.recipientCount = await Account.countDocuments({
//         isVerified: true,
//         isDeleted: false,
//       });
//     } else if (rest.recipientType == "specific") {
//       if (!rest.groupID) {
//         throw new AppError(
//           400,
//           "Group ID is required for specific recipient type"
//         );
//       }
//       const group = await NotificationGroup.findOne({
//         _id: rest.groupID,
//       });
//       if (!group) {
//         throw new AppError(404, "Notification group not found!");
//       }
//       rest.recipientCount = rest.recipients.length;
//     }
//     const notification = await Notifications.findOneAndUpdate(
//       {
//         _id: notificationID,
//       },
//       rest,
//       { new: true }
//     );
//     if (!notification) {
//       throw new AppError(404, "Notification not found!");
//     }
//     return notification;
//   }

//   public async deleteNotification(notificationID: string) {
//     const notification = await Notifications.findOneAndDelete({
//       _id: notificationID,
//     });
//     if (!notification) {
//       throw new AppError(404, "Notification not found!");
//     }

//     return;
//   }

//   public async sendNotification(notificationID: string) {
//     const notification = await Notifications.findOne({
//       _id: notificationID,
//     });
//     if (!notification) {
//       throw new AppError(404, "Notification template not found!");
//     }
//     // let { title, body, recipients, recipientType } = notification;

//     // let recipientTokens;
//     // if (recipientType == "all") {
//     //   const accounts = await Account.find({ isDeleted: false });
//     //   recipients = await this.getAccountsID(accounts);
//     //   recipientTokens = await this.getGroupAccountFCMToken(accounts);
//     // } else if (recipientType == "verified") {
//     //   const accounts = await Account.find({
//     //     isVerified: true,
//     //     isDeleted: false,
//     //   });
//     //   recipients = await this.getAccountsID(accounts);
//     //   recipientTokens = await this.getGroupAccountFCMToken(accounts);
//     // } else {
//     //   recipientTokens = await this.getGroupAccountFCMToken(recipients);
//     // }
//     // notificationEventEmitter.emit("admin", {
//     //   title,
//     //   body,
//     //   recipients,
//     // });
//     return;
//   }
//   // private async getGroupAccountFCMToken(accounts: any) {
//   //   const availableFCMToken = [];
//   //   for (var account of accounts) {
//   //     const token = await Account.findOne({
//   //       _id: account,
//   //       isDeleted: false,
//   //     }).select("deviceToken");
//   //     if (
//   //       !token ||
//   //       !token.deviceToken?.enabled ||
//   //       token.deviceToken?.value.length === 0
//   //     ) {
//   //       continue;
//   //     }
//   //     availableFCMToken.push(token.deviceToken);
//   //   }
//   //   return availableFCMToken;
//   // }

//   private async getAccountsID(accounts: any) {
//     let accountIDs = [];
//     for (var account of accounts) {
//       accountIDs.push(account._id);
//     }
//     return accountIDs;
//   }
// }
