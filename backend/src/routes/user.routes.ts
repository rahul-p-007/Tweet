import { Router } from "express";
import { isAuthenticated } from "../middleware/isAuthenticated";
import {
  followUnfollowUser,
  getSuggestedUsers,
  getUserProfile,
  updateUser,
} from "../controllers/user.controller";
const routes = Router();

routes.get("/profile/:username", isAuthenticated, getUserProfile);
routes.get("/suggested", isAuthenticated, getSuggestedUsers);
routes.post("/follow/:id", isAuthenticated, followUnfollowUser);
routes.post("/update", isAuthenticated, updateUser);
export default routes;
