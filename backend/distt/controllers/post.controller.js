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
exports.getUserPosts = exports.getAllFollowingPosts = exports.getLikedPosts = exports.getAllPosts = exports.likeUnlikePost = exports.commentOnPost = exports.deletePost = exports.createPost = void 0;
const user_model_1 = require("../models/user.model");
const post_model_1 = require("../models/post.model");
const cloudinary_1 = require("cloudinary");
const notification_model_1 = require("../models/notification.model");
const createPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { text } = req.body;
        let { img } = req.body;
        const userId = req.user._id.toString();
        const user = yield user_model_1.User.findById(userId);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        if (!text && !img) {
            return res.status(400).json({ error: " Text and image are required" });
        }
        if (img) {
            const uploadedImage = yield cloudinary_1.v2.uploader.upload(img);
            img = uploadedImage.secure_url;
        }
        const newPost = new post_model_1.Post({
            user: userId,
            text,
            img,
        });
        yield newPost.save();
        return res.status(201).json(newPost);
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong" });
        console.log("Error in createPost controller:", error.message);
    }
});
exports.createPost = createPost;
const deletePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const post = yield post_model_1.Post.findByIdAndDelete(req.params.id);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (post.img) {
            const imageId = (_a = post.img.split("/").pop()) === null || _a === void 0 ? void 0 : _a.split(".")[0];
            if (imageId) {
                yield cloudinary_1.v2.uploader.destroy(imageId);
            }
        }
        yield post_model_1.Post.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: "Post deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong" });
        console.log("Error in deletePost controller:", error);
    }
});
exports.deletePost = deletePost;
const commentOnPost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;
        if (!text)
            return res.status(400).json({ error: "Text is required" });
        const post = yield post_model_1.Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        const comment = {
            user: userId,
            text,
        };
        post.comments.push(comment);
        yield post.save();
        return res.status(200).json(post);
    }
    catch (error) {
        console.log("Error in commentOnPost controller:", error.message);
        return res.status(500).json({ error: "Something went wrong" });
    }
});
exports.commentOnPost = commentOnPost;
const likeUnlikePost = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const { id: postId } = req.params;
        const post = yield post_model_1.Post.findById(postId);
        if (!post) {
            return res.status(404).json({ error: "Post not found" });
        }
        const userLikedPost = post.likes.includes(userId);
        if (userLikedPost) {
            yield post_model_1.Post.updateOne({
                _id: postId,
            }, {
                $pull: {
                    likes: userId,
                },
            });
            yield user_model_1.User.updateOne({
                _id: userId,
            }, {
                $pull: {
                    likedPosts: postId,
                },
            });
            const updatedLikes = post.likes.filter((id) => id.toString() !== userId);
            res.status(200).json(updatedLikes);
        }
        else {
            post.likes.push(userId);
            yield post.save();
            const notification = new notification_model_1.Notification({
                from: userId,
                to: post.user,
                type: "like",
            });
            yield user_model_1.User.updateOne({
                _id: userId,
            }, {
                $push: {
                    likedPosts: postId,
                },
            });
            yield notification.save();
            const upatedLikes = post.likes;
            res.status(200).json(upatedLikes);
        }
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong" });
        console.log("Error in likeUnlikePost controller:", error);
    }
});
exports.likeUnlikePost = likeUnlikePost;
const getAllPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield post_model_1.Post.find()
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
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong" });
        console.log("Error in getAllPosts controller:", error);
    }
});
exports.getAllPosts = getAllPosts;
const getLikedPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.id;
    try {
        const user = yield user_model_1.User.findById(userId);
        if (!user)
            return res.status(404).json({
                error: "User not found",
            });
        const likedPosts = yield post_model_1.Post.find({
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
    }
    catch (error) {
        console.log("Error in getLikedPosts controller:", error.message);
        return res.status(500).json({
            error: "Something went wrong",
        });
    }
});
exports.getLikedPosts = getLikedPosts;
const getAllFollowingPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const user = yield user_model_1.User.findById(userId);
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const following = user.following;
        const feedPost = yield post_model_1.Post.find({
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
    }
    catch (error) {
        console.log("Error in getAllFollowingPosts controller:", error.message);
        return res.status(500).json({ error: "Something went wrong" });
    }
});
exports.getAllFollowingPosts = getAllFollowingPosts;
const getUserPosts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username } = req.params;
        const user = yield user_model_1.User.findOne({ username });
        if (!user)
            return res.status(404).json({ error: "User not found" });
        const posts = yield post_model_1.Post.find({
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
    }
    catch (error) {
        res.status(500).json({ error: "Something went wrong" });
        console.log("Error in getUserPosts controller:", error);
    }
});
exports.getUserPosts = getUserPosts;
