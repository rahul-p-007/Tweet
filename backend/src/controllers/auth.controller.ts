import { Request, Response } from "express";
import { User } from "../models/user.model";
import z from "zod";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateTokenAndSetCookie";

export const signup = async (req: Request, res: Response) => {
  try {
    const { username, fullName, email, password } = req.body;

    // ✅ 1. Zod Validation First
    const passwordSchema = z
      .string()
      .min(5, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/\d/, "Must contain at least one number");

    const ZodSchema = z.object({
      username: z.string().min(5, "Enter at least 5 characters"),
      email: z.string().email("Invalid email format"),
      fullName: z.string(),
      password: passwordSchema,
    });

    const userValidated = ZodSchema.safeParse({
      username,
      email,
      fullName,
      password,
    });

    if (!userValidated.success) {
      return res.status(400).json({
        success: false,
        message: "Enter the input fields in correct character",
        error: userValidated.error.issues,
      });
    }

    // ✅ 2. Check if user already exists (fix: await and use findOne)

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        message: "Email already exists. Please use a different one.",
      });
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({
        message: "Username already exists. Please use a different one",
      });
    }

    const passwordHashed = await bcrypt.hash(password, 10);

    // ✅ 3. Create new user
    const newUser = new User({
      username,
      fullName,
      email,
      password: passwordHashed,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
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
    } else {
      return res.status(400).json({
        error: "Invalid user data",
      });
    }
  } catch (error) {
    console.error("Signup error:", error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Enter the input fields in correct character",
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({
        message: "User not exists",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Password is incorrect",
      });
    }
    generateTokenAndSetCookie(user._id, res);
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
  } catch (error) {
    console.error("login error:", error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};
export const logout = (req: Request, res: Response) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
    });
    res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Error in GetMe controller:", error);
    return res.status(500).json({
      message: "Internal server error. Something went wrong",
    });
  }
};
