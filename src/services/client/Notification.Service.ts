import { UserInAppNotifications } from "../../models/Notification.Model";
import AppError from "../../utilities/ErrorHandler";
import { paginateModel } from "../../utilities/Pagination.Helper";

export class NotificationService {
  public async getNotifications(accountID: string, filter: any) {
    const { notificationID, page, limit } = filter;
    if (notificationID) {
      const notification = await UserInAppNotifications.findOne({
        _id: notificationID,
      });
      if (!notification) {
        throw new AppError(404, "Notification not found!");
      }
      return notification;
    }
    const accountNotifications = await paginateModel(
      UserInAppNotifications,
      { accountID },
      page,
      limit
    );
    return accountNotifications;
  }

  public async updateNotification(accountID: string, payload: any) {
    const { notificationID, status } = payload;
    const notification = await UserInAppNotifications.findOneAndUpdate(
      {
        accountID,
        _id: notificationID,
      },
      { status },
      { new: true }
    );
    if (!notification) {
      throw new AppError(404, "Notification not found!");
    }
    return notification;
  }

  public async deleteNotification(accountID: string, notificationID: string) {
    const notification = await UserInAppNotifications.findOneAndDelete({
      accountID,
      _id: notificationID,
    });
    if (!notification) {
      throw new AppError(404, "Notification not found!");
    }
    return;
  }
}
