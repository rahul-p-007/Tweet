import { Router } from "express";
import { getMe, login, logout, signup } from "../controllers/auth.controller";
import { isAuthenticated } from "../middleware/isAuthenticated";
const routes = Router();

routes.get("/me", isAuthenticated, getMe);
routes.post("/signup", signup);
routes.post("/login", login);
routes.get("/logout", logout);

export default routes;
