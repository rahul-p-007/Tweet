import { Router } from "express";
import { isAuthenticated } from "../middleware/isAuthenticated";
import {
  commentOnPost,
  createPost,
  deletePost,
  getAllFollowingPosts,
  getAllPosts,
  getLikedPosts,
  getUserPosts,
  likeUnlikePost,
} from "../controllers/post.controller";
const routes = Router();

routes.get("/all", isAuthenticated, getAllPosts);
routes.get("/following", isAuthenticated, getAllFollowingPosts);
routes.get("/likes/:id", isAuthenticated, getLikedPosts);
routes.get("/user/:username", isAuthenticated, getUserPosts);
routes.post("/create", isAuthenticated, createPost);
routes.post("/like/:id", isAuthenticated, likeUnlikePost);
routes.post("/comment/:id", isAuthenticated, commentOnPost);
routes.delete("/:id", isAuthenticated, deletePost);

export default routes;
