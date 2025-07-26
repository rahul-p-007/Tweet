"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = exports.NotificationType = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
var NotificationType;
(function (NotificationType) {
    NotificationType["FOLLOW"] = "follow";
    NotificationType["LIKE"] = "like";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
const notificationSchema = new mongoose_1.default.Schema({
    from: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    to: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    type: {
        type: String,
        required: true,
        enum: Object.values(NotificationType),
    },
    read: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
exports.Notification = mongoose_1.default.model("Notification", notificationSchema);
