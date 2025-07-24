import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Post } from "../models/post.model";
import { v2 as cloudinary } from "cloudinary";
import { Notification } from "../models/notification.model";
export const createPost = async (req: any, res: Response) => {
  try {
    const { text } = req.body;
    let { img } = req.body;
    const userId = req.user._id.toString();

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (!text && !img) {
      return res.status(400).json({ error: " Text and image are required" });
    }

    if (img) {
      const uploadedImage = await cloudinary.uploader.upload(img);

      img = uploadedImage.secure_url;
    }

    const newPost = new Post({
      user: userId,
      text,
      img,
    });
    await newPost.save();

    return res.status(201).json(newPost);
  } catch (error: any) {
    res.status(500).json({ error: "Something went wrong" });
    console.log("Error in createPost controller:", error.message);
  }
};

export const deletePost = async (req: any, res: Response) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (post.img) {
      const imageId = post.img.split("/").pop()?.split(".")[0];
      if (imageId) {
        await cloudinary.uploader.destroy(imageId);
      }
    }

    await Post.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
    console.log("Error in deletePost controller:", error);
  }
};

export const commentOnPost = async (req: any, res: Response) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) return res.status(400).json({ error: "Text is required" });

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const comment = {
      user: userId,
      text,
    };
    post.comments.push(comment);
    await post.save();
    return res.status(200).json(post);
  } catch (error: any) {
    console.log("Error in commentOnPost controller:", error.message);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const likeUnlikePost = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;
    const { id: postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    const userLikedPost = post.likes.includes(userId);
    if (userLikedPost) {
      await Post.updateOne(
        {
          _id: postId,
        },
        {
          $pull: {
            likes: userId,
          },
        }
      );
      await User.updateOne(
        {
          _id: userId,
        },
        {
          $pull: {
            likedPosts: postId,
          },
        }
      );

      const updatedLikes = post.likes.filter((id) => id.toString() !== userId);
      res.status(200).json(updatedLikes);
    } else {
      post.likes.push(userId);
      await post.save();
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await User.updateOne(
        {
          _id: userId,
        },
        {
          $push: {
            likedPosts: postId,
          },
        }
      );
      await notification.save();

      const upatedLikes = post.likes;

      res.status(200).json(upatedLikes);
    }
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
    console.log("Error in likeUnlikePost controller:", error);
  }
};

export const getAllPosts = async (req: any, res: Response) => {
  try {
    const post = await Post.find()
      .sort({
        createdAt: -1,
      })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    if (post.length === 0) {
      res.status(404).json({ error: "No posts found" });
    }
    return res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
    console.log("Error in getAllPosts controller:", error);
  }
};

export const getLikedPosts = async (req: any, res: Response) => {
  const userId = req.params.id;
  try {
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({
        error: "User not found",
      });

    const likedPosts = await Post.find({
      _id: {
        $in: user.likedPosts,
      },
    })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    return res.status(200).json(likedPosts);
  } catch (error: any) {
    console.log("Error in getLikedPosts controller:", error.message);
    return res.status(500).json({
      error: "Something went wrong",
    });
  }
};

export const getAllFollowingPosts = async (req: any, res: Response) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    const following = user.following;
    const feedPost = await Post.find({
      user: {
        $in: following,
      },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    res.status(200).json(feedPost);
  } catch (error: any) {
    console.log("Error in getAllFollowingPosts controller:", error.message);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

export const getUserPosts = async (req: any, res: Response) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });
    const posts = await Post.find({
      user: user._id,
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
    console.log("Error in getUserPosts controller:", error);
  }
};
