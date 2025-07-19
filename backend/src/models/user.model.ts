import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IUser extends Document {
  username: string;
  fullName: string;
  email: string;
  password: string;
  followers: Types.ObjectId[];
  following: Types.ObjectId[];
  profileImg?: string;
  bio?: string;
  link?: string;
  coverImg?: string;
  createdAt?: Date;
  updatedAt?: Date;
  likedPosts: Types.ObjectId[];
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    profileImg: {
      type: String,
      default: "",
    },
    coverImg: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    link: {
      type: String,
      default: "",
    },
    likedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
