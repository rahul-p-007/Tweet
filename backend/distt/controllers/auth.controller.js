"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.login = exports.signup = void 0;
const user_model_1 = require("../models/user.model");
const zod_1 = __importDefault(require("zod")); // Zod for schema validation
const bcryptjs_1 = __importDefault(require("bcryptjs")); // bcrypt for password hashing
const generateTokenAndSetCookie_1 = require("../lib/utils/generateTokenAndSetCookie"); // Utility to generate JWT and set as cookie
/**
 * Controller for user signup. Handles new user registration.
 * @param req Express Request object (expects username, fullName, email, password in body)
 * @param res Express Response object
 */
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, fullName, email, password } = req.body; // Destructure user input from request body
        // ✅ 1. Zod Validation for input fields
        // Define schema for password complexity
        const passwordSchema = zod_1.default
            .string()
            .min(5, "Password must be at least 8 characters") // Minimum length for password
            .regex(/[A-Z]/, "Must contain at least one uppercase letter") // Requires at least one uppercase letter
            .regex(/[a-z]/, "Must contain at least one lowercase letter") // Requires at least one lowercase letter
            .regex(/\d/, "Must contain at least one number"); // Requires at least one digit
        // Define the main Zod schema for user signup data
        const ZodSchema = zod_1.default.object({
            username: zod_1.default.string().min(5, "Enter at least 5 characters"), // Username must be at least 5 characters
            email: zod_1.default.string().email("Invalid email format"), // Email must be a valid email format
            fullName: zod_1.default.string(), // Full name is a string
            password: passwordSchema, // Password must adhere to the passwordSchema
        });
        // Validate the incoming request body against the Zod schema
        const userValidated = ZodSchema.safeParse({
            username,
            email,
            fullName,
            password,
        });
        // If validation fails, return a 400 Bad Request with validation errors
        if (!userValidated.success) {
            return res.status(400).json({
                success: false,
                message: "Enter the input fields in correct character",
                error: userValidated.error.issues, // Provide detailed Zod validation issues
            });
        }
        // ✅ 2. Check if user already exists (by email or username)
        // Check if an account with the provided email already exists
        const existingEmail = yield user_model_1.User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                message: "Email already exists. Please use a different one.",
            });
        }
        // Check if an account with the provided username already exists
        const existingUsername = yield user_model_1.User.findOne({ username });
        if (existingUsername) {
            return res.status(400).json({
                message: "Username already exists. Please use a different one",
            });
        }
        // Hash the password for security before saving to the database
        const passwordHashed = yield bcryptjs_1.default.hash(password, 10); // 10 rounds for salting
        // ✅ 3. Create new user instance
        const newUser = new user_model_1.User({
            username,
            fullName,
            email,
            password: passwordHashed, // Store the hashed password
        });
        // If the new user object was successfully created
        if (newUser) {
            // Generate a JWT token and set it as an HTTP-only cookie
            (0, generateTokenAndSetCookie_1.generateTokenAndSetCookie)(newUser._id, res);
            yield newUser.save(); // Save the new user to the database
            // Return a 201 Created status with success message and user details (excluding password)
            return res.status(201).json({
                message: "User created successfully",
                user: {
                    _id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    fullName: newUser.fullName,
                    followers: newUser.followers,
                    following: newUser.following,
                    profileImg: newUser.profileImg,
                    coverImg: newUser.coverImg,
                },
            });
        }
        else {
            // If newUser object somehow fails to be created (e.g., invalid data for Mongoose schema)
            return res.status(400).json({
                error: "Invalid user data",
            });
        }
    }
    catch (error) {
        // Catch any unexpected errors during the signup process
        console.error("Signup error:", error);
        return res.status(500).json({
            message: "Something went wrong", // Generic error message for client
        });
    }
});
exports.signup = signup;
/**
 * Controller for user login. Authenticates existing users.
 * @param req Express Request object (expects username, password in body)
 * @param res Express Response object
 */
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body; // Destructure username and password from request body
        // Basic validation: check if both fields are provided
        if (!username || !password) {
            return res.status(400).json({
                message: "Enter the input fields in correct character",
            });
        }
        // Find the user by username
        const user = yield user_model_1.User.findOne({ username });
        if (!user) {
            // If user not found, return 400 Bad Request
            return res.status(400).json({
                message: "User not exists",
            });
        }
        // Compare the provided password with the hashed password in the database
        const isPasswordCorrect = yield bcryptjs_1.default.compare(password, (user === null || user === void 0 ? void 0 : user.password) || "" // Use optional chaining and default to empty string for type safety
        );
        if (!isPasswordCorrect) {
            // If passwords don't match, return 400 Bad Request
            return res.status(400).json({
                message: "Password is incorrect",
            });
        }
        // Generate a JWT token and set it as an HTTP-only cookie upon successful login
        (0, generateTokenAndSetCookie_1.generateTokenAndSetCookie)(user._id, res);
        // Return a 200 OK status with success message and user details (excluding password)
        res.status(200).json({
            message: "User logged in successfully",
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                followers: user.followers,
                following: user.following,
                profileImg: user.profileImg,
                coverImg: user.coverImg,
            },
        });
    }
    catch (error) {
        // Catch any unexpected errors during the login process
        console.error("login error:", error);
        return res.status(500).json({
            message: "Something went wrong", // Generic error message for client
        });
    }
});
exports.login = login;
/**
 * Controller for user logout. Clears the authentication cookie.
 * @param req Express Request object
 * @param res Express Response object
 */
const logout = (req, res) => {
    try {
        // Clear the JWT cookie by setting its maxAge to 0
        res.cookie("jwt", "", {
            maxAge: 0,
        });
        // Return a 200 OK status with success message
        res.status(200).json({
            message: "User logged out successfully",
        });
    }
    catch (error) {
        // Catch any unexpected errors during the logout process
        console.error("Logout error:", error);
        return res.status(500).json({
            message: "Something went wrong", // Generic error message for client
        });
    }
};
exports.logout = logout;
/**
 * Controller to get the authenticated user's profile details.
 * This is typically used to fetch the current user's data after authentication.
 * @param req Express Request object (expects `req.user._id` set by authentication middleware)
 * @param res Express Response object
 */
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the user by their ID (from the authenticated request) and exclude the password field
        const user = yield user_model_1.User.findById(req.user._id).select("-password");
        // Return the user profile data
        res.status(200).json(user);
    }
    catch (error) {
        // Catch any unexpected errors
        console.error("Error in GetMe controller:", error);
        return res.status(500).json({
            message: "Internal server error. Something went wrong", // Generic error message
        });
    }
});
exports.getMe = getMe;
