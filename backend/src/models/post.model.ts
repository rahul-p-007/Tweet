import mongoose, { Model, Types } from "mongoose";

export interface IPost extends Document {
  user: Types.ObjectId;
  text?: string;
  img?: string;
  likes: Types.ObjectId[];
  comments: {
    text: string;
    user: Types.ObjectId;
  }[];
}

const postSchema: mongoose.Schema<IPost> = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
    },
    img: {
      type: String,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        text: {
          type: String,
          required: true,
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Post: Model<IPost> = mongoose.model<IPost>("Post", postSchema);
