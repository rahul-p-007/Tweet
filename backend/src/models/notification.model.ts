import mongoose, { Document, Model, Schema, Types } from "mongoose";

export enum NotificationType {
  FOLLOW = "follow",
  LIKE = "like",
}

export interface INotification extends Document {
  from: Types.ObjectId;
  to: Types.ObjectId;
  type: NotificationType;
  read?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const notificationSchema: Schema<INotification> = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
  }
);

export const Notification: Model<INotification> = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
