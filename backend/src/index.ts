import express from "express";
import dotenv from "dotenv";
import { db_connect } from "./connect/db_connect";
import routes from "./routes/auth.routes";
dotenv.config();

const app = express();
app.use(express.json());
app.use(routes);

db_connect(app);
