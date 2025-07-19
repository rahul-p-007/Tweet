import { Router } from "express";
import { login, logout, singup } from "../controllers/auth.controller";
const routes = Router();

routes.post("/signup", singup);
routes.post("/login", login);
routes.get("/logout", logout);

export default routes;
