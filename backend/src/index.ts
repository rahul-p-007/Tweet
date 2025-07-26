import express from "express"; // Import the Express framework
import dotenv from "dotenv"; // Import dotenv to load environment variables from .env file
import { db_connect } from "./connect/db_connect"; // Import the database connection function
import authRoutes from "./routes/auth.routes"; // Import authentication-related routes
import userRoutes from "./routes/user.routes"; // Import user-related routes
import postRoutes from "./routes/post.routes";
import notificationRoutes from "./routes/notification.route";
import cookieParser from "cookie-parser"; // Import cookie-parser middleware to parse cookies
import { v2 as cloudinary } from "cloudinary"; // Import Cloudinary SDK for cloud image management
import path from "path";
import cors from "cors";

dotenv.config(); // Load environment variables from the .env file into process.env

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Cloudinary cloud name
  api_key: process.env.CLOUDINARY_API_KEY, // Cloudinary API key
  api_secret: process.env.CLOUDINARY_API_SECRET, // Cloudinary API secret
});

const app = express(); // Create an Express application instance
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

// const __dirname = path.resolve();

// Middleware to parse JSON bodies from incoming requests.
// This allows Express to understand JSON data sent in the request body (e.g., from POST requests).
app.use(
  express.json({
    limit: "5mb",
  })
);

// Middleware to parse URL-encoded bodies from incoming requests.
// `extended: true` allows for rich objects and arrays to be encoded into the URL-encoded format.
// This is typically used for parsing data from HTML forms.
app.use(express.urlencoded({ extended: true }));

// Middleware to parse cookies attached to the client request object.
// This makes cookie data available under `req.cookies`.
app.use(cookieParser());

// Mount authentication routes under the '/api/auth' prefix.
// All routes defined in `authRoutes` will be accessible via paths like '/api/auth/signup', '/api/auth/login', etc.
app.use("/api/auth", authRoutes);

// Mount user-related routes under the '/api/users' prefix.
// All routes defined in `userRoutes` will be accessible via paths like '/api/users/:id', '/api/users/profile', etc.
app.use("/api/users", userRoutes);

app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  });
}

// The commented-out line `app.use(routes);` suggests a previous or alternative routing setup.
// In the current setup, specific route modules are mounted individually.

// Connect to the database and start the server.
// The `db_connect` function is expected to handle the database connection
// and then potentially start the Express server (e.g., app.listen) once the connection is established.
db_connect(app);
