import mongoose from "mongoose";
import dotenv from "dotenv";
import { Express } from "express";
dotenv.config();
const PORT = process.env.PORT;

export const db_connect = async (app: Express) => {
  try {
    await mongoose.connect(process.env.MONGO_URL!, {
      dbName: "tweetDb",
    });
    console.log("MongoDB is connected");
    app.listen(PORT, () => {
      console.log("Server is running on port 4000");
    });
  } catch (error: any) {
    console.log("Error in DB connection");
    console.log(error.message);
    process.exit(1);
  }
};
