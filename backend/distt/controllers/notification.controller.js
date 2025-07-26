"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotificationById = exports.deleteNotification = exports.getAllNotifications = void 0;
const notification_model_1 = require("../models/notification.model");
const getAllNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        console.log("userId from req.user:", req.user._id);
        const notification = yield notification_model_1.Notification.find({ to: userId }).populate({
            path: "from",
            select: "username,profileImg",
        });
        yield notification_model_1.Notification.updateMany({ to: userId }, { read: true });
        return res.status(200).json(notification);
    }
    catch (error) {
        console.log("Error in getAllNotifications controller:", error.message);
        return res.status(500).json({ error: "Something went wrong" });
    }
});
exports.getAllNotifications = getAllNotifications;
const deleteNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        yield notification_model_1.Notification.deleteMany({ to: userId });
        res.status(200).json({ message: "Notifications deleted successfully" });
    }
    catch (error) {
        console.log("Error in deleteNotification controller:", error);
        return res.status(500).json({ error: "Something went wrong" });
    }
});
exports.deleteNotification = deleteNotification;
const deleteNotificationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notificationId = req.params.id;
        const userId = req.user._id;
        const notification = yield notification_model_1.Notification.findById({ notificationId });
        if (!notificationId) {
            return res.status(404).json({
                error: "Notification not found",
            });
        }
        if ((notification === null || notification === void 0 ? void 0 : notification.to.toString()) !== userId.toString()) {
            return res.status(403).json({
                error: "You are not allowed to delete this notification",
            });
        }
        yield notification_model_1.Notification.findByIdAndDelete(notificationId);
        res.status(200).json({ message: "Notification deleted successfully" });
    }
    catch (error) {
        console.log("Error in deleteNotificationById controller:", error);
        return res.status(500).json({ error: "Something went wrong" });
    }
});
exports.deleteNotificationById = deleteNotificationById;
