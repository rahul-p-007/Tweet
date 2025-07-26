"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express")); // Import the Express framework
const dotenv_1 = __importDefault(require("dotenv")); // Import dotenv to load environment variables from .env file
const db_connect_1 = require("./connect/db_connect"); // Import the database connection function
const auth_routes_1 = __importDefault(require("./routes/auth.routes")); // Import authentication-related routes
const user_routes_1 = __importDefault(require("./routes/user.routes")); // Import user-related routes
const post_routes_1 = __importDefault(require("./routes/post.routes"));
const notification_route_1 = __importDefault(require("./routes/notification.route"));
const cookie_parser_1 = __importDefault(require("cookie-parser")); // Import cookie-parser middleware to parse cookies
const cloudinary_1 = require("cloudinary"); // Import Cloudinary SDK for cloud image management
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config(); // Load environment variables from the .env file into process.env
// Configure Cloudinary with credentials from environment variables
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // Cloudinary cloud name
    api_key: process.env.CLOUDINARY_API_KEY, // Cloudinary API key
    api_secret: process.env.CLOUDINARY_API_SECRET, // Cloudinary API secret
});
const app = (0, express_1.default)(); // Create an Express application instance
app.use((0, cors_1.default)({
    origin: "http://localhost:3000",
    credentials: true,
}));
// const __dirname = path.resolve();
// Middleware to parse JSON bodies from incoming requests.
// This allows Express to understand JSON data sent in the request body (e.g., from POST requests).
app.use(express_1.default.json({
    limit: "5mb",
}));
// Middleware to parse URL-encoded bodies from incoming requests.
// `extended: true` allows for rich objects and arrays to be encoded into the URL-encoded format.
// This is typically used for parsing data from HTML forms.
app.use(express_1.default.urlencoded({ extended: true }));
// Middleware to parse cookies attached to the client request object.
// This makes cookie data available under `req.cookies`.
app.use((0, cookie_parser_1.default)());
// Mount authentication routes under the '/api/auth' prefix.
// All routes defined in `authRoutes` will be accessible via paths like '/api/auth/signup', '/api/auth/login', etc.
app.use("/api/auth", auth_routes_1.default);
// Mount user-related routes under the '/api/users' prefix.
// All routes defined in `userRoutes` will be accessible via paths like '/api/users/:id', '/api/users/profile', etc.
app.use("/api/users", user_routes_1.default);
app.use("/api/posts", post_routes_1.default);
app.use("/api/notifications", notification_route_1.default);
if (process.env.NODE_ENV === "production") {
    app.use(express_1.default.static(path_1.default.join(__dirname, "/frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path_1.default.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}
// The commented-out line `app.use(routes);` suggests a previous or alternative routing setup.
// In the current setup, specific route modules are mounted individually.
// Connect to the database and start the server.
// The `db_connect` function is expected to handle the database connection
// and then potentially start the Express server (e.g., app.listen) once the connection is established.
(0, db_connect_1.db_connect)(app);
