import express from "express";
import dotenv from "dotenv";
import { db_connect } from "./connect/db_connect";
import authRoutes from "./routes/auth.routes";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/auth", authRoutes);

// app.use(routes);

db_connect(app);
