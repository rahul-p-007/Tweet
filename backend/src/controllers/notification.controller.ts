import { error } from "console";
import { Response } from "express";
import { Notification } from "../models/notification.model";

export const getAllNotifications = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;
    console.log("userId from req.user:", req.user._id);

    const notification = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username,profileImg",
    });
    await Notification.updateMany({ to: userId }, { read: true });
    return res.status(200).json(notification);
  } catch (error: any) {
    console.log("Error in getAllNotifications controller:", error.message);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const deleteNotification = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;
    await Notification.deleteMany({ to: userId });
    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.log("Error in deleteNotification controller:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const deleteNotificationById = async (req: any, res: Response) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user._id;
    const notification = await Notification.findById({ notificationId });
    if (!notificationId) {
      return res.status(404).json({
        error: "Notification not found",
      });
    }
    if (notification?.to.toString() !== userId.toString()) {
      return res.status(403).json({
        error: "You are not allowed to delete this notification",
      });
    }
    await Notification.findByIdAndDelete(notificationId);
    res.status(200).json({ message: "Notification deleted successfully" });
  } catch (error) {
    console.log("Error in deleteNotificationById controller:", error);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
