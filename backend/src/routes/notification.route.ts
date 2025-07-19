import { Router } from "express";
import { isAuthenticated } from "../middleware/isAuthenticated";
import {
  deleteNotification,
  deleteNotificationById,
  getAllNotifications,
} from "../controllers/notification.controller";
const routes = Router();

routes.get("/", isAuthenticated, getAllNotifications);
routes.delete("/", isAuthenticated, deleteNotification);
routes.delete("/:id", isAuthenticated, deleteNotificationById);
export default routes;
