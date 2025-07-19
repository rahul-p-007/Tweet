import { Request, Response } from "express";
import { User } from "../models/user.model";
import { Notification } from "../models/notification.model";
import bcrypt from "bcryptjs";
import z from "zod"; // Zod is used for schema validation

import { v2 as cloudinary } from "cloudinary"; // Cloudinary is used for image (profile/cover) uploads

/**
 * Controller to get a user's profile by their username.
 * @param req Express Request object (expects `username` in params)
 * @param res Express Response object
 */
export const getUserProfile = async (req: Request, res: Response) => {
  const { username } = req.params; // Extract username from request parameters
  try {
    // Find the user by username and exclude the password field
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      // If user is not found, return 404
      return res.status(404).json({
        error: "User not found",
      });
    }
    // Return the user profile data
    res.status(200).json({
      user,
    });
  } catch (error: any) {
    // Handle any errors during the process
    res.status(500).json({
      error: error.message,
    });
    console.log("Error in getUserProfile controller:", error.message);
  }
};

/**
 * Controller to follow or unfollow a user.
 * @param req Express Request object (expects `id` of user to modify in params, and `req.user._id` for current user)
 * @param res Express Response object
 */
export const followUnfollowUser = async (req: any, res: Response) => {
  try {
    const { id } = req.params; // ID of the user to follow/unfollow
    const userToModify = await User.findById(id); // Get the user to be modified
    const currentUser = await User.findById(req.user._id); // Get the currently authenticated user

    // Prevent a user from following/unfollowing themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        error: "You can't follow/unfollow yourself",
      });
    }

    // Check if both users exist
    if (!userToModify || !currentUser) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Check if the current user is already following the userToModify
    const isFollowing = currentUser.following.includes(id);

    if (isFollowing) {
      // If already following, unfollow the user
      // Remove current user's ID from userToModify's followers array
      await User.findByIdAndUpdate(id, {
        $pull: {
          followers: req.user._id,
        },
      });
      // Remove userToModify's ID from current user's following array
      await User.findByIdAndUpdate(req.user._id, {
        $pull: {
          following: id,
        },
      });
      res.status(200).json({
        message: "User unfollowed successfully",
      });
    } else {
      // If not following, follow the user
      // Add current user's ID to userToModify's followers array
      await User.findByIdAndUpdate(id, {
        $push: { followers: req.user._id },
      });
      // Add userToModify's ID to current user's following array
      await User.findByIdAndUpdate(req.user._id, {
        $push: {
          following: id,
        },
      });

      // Create a new follow notification for the userToModify
      const newNotification = new Notification({
        type: "follow",
        from: req.user._id, // User who initiated the follow
        to: userToModify._id, // User who was followed
      });
      await newNotification.save(); // Save the notification to the database

      res.status(200).json({
        message: "User followed successfully",
      });
    }
  } catch (error: any) {
    // Handle any errors during the process
    res.status(500).json({
      error: error.message,
    });
    console.log("Error in FollowUnfollowUser controller:", error.message);
  }
};

/**
 * Controller to get a list of suggested users to follow.
 * @param req Express Request object (expects `req.user._id` for current user)
 * @param res Express Response object
 */
export const getSuggestedUsers = async (req: any, res: Response) => {
  try {
    const userId = req.user._id; // Get the ID of the currently authenticated user

    // Get the list of users that the current user is already following
    const usersFollowedByMe = await User.findById(userId).select("following");

    // Aggregate users:
    // 1. $match: Exclude the current user from the suggestions
    // 2. $sample: Randomly select up to 10 users from the remaining users
    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: userId }, // Exclude current user
        },
      },
      {
        $sample: { size: 10 }, // Get up to 10 random users
      },
    ]);

    // Filter out users that the current user is already following from the sampled users
    const filterUsers = users.filter(
      (user) => !usersFollowedByMe?.following.includes(user._id)
    );

    // Take the first 4 suggested users after filtering
    const suggestedUsers = filterUsers.slice(0, 4);

    // Remove the password field from each suggested user object for security
    suggestedUsers.forEach((user) => (user.password = null));

    // Send the list of suggested users
    res.status(200).json(suggestedUsers);
  } catch (error: any) {
    // Handle any errors during the process
    res.status(500).json({
      error: error.message,
    });
    console.log("Error in getSuggestedUsers controller:", error.message);
  }
};

/**
 * Controller to update a user's profile information.
 * @param req Express Request object (expects various profile fields in `req.body` and `req.user._id` for current user)
 * @param res Express Response object
 */
export const updateUser = async (req: any, res: Response) => {
  const {
    fullName,
    email,
    username,
    currentPassword,
    newPassword,
    bio,
    link,
    profileImg,
    coverImg,
  } = req.body; // Destructure fields from the request body

  const userId = req.user._id; // Get the ID of the currently authenticated user

  // Zod schema for password validation
  const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters") // Minimum length
    .regex(/[A-Z]/, "Must contain at least one uppercase letter") // At least one uppercase letter
    .regex(/[a-z]/, "Must contain at least one lowercase letter") // At least one lowercase letter
    .regex(/\d/, "Must contain at least one number"); // At least one digit

  try {
    // Find the user by their ID
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Handle password update logic
    // Check if only one of currentPassword or newPassword is provided
    if (
      (currentPassword && !newPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res.status(400).json({
        error: "Please enter both current password and new password",
      });
    }

    // If both current and new passwords are provided, proceed with password change
    if (currentPassword && newPassword) {
      // Compare the provided current password with the hashed password in the database
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          error: "Current password is incorrect",
        });
      }

      // Validate the new password against the Zod schema
      const isPasswordValid = passwordSchema.safeParse(newPassword);
      if (!isPasswordValid.success) {
        return res.status(400).json({
          error: isPasswordValid.error.issues[0].message, // Return the first validation error message
        });
      }

      // Hash the new password and update it
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Handle profile image update
    if (profileImg) {
      // If an old profile image exists, destroy it from Cloudinary
      if (user.profileImg) {
        // Extract public ID from the Cloudinary URL
        const publicId = user.profileImg?.split("/").pop()?.split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }
      // Upload the new profile image to Cloudinary
      const uploaded = await cloudinary.uploader.upload(profileImg);
      user.profileImg = uploaded.secure_url; // Save the secure URL
    }

    // Handle cover image update (similar logic to profile image)
    if (coverImg) {
      if (user.coverImg) {
        // IMPORTANT: There was a potential bug here. It was trying to delete `user.profileImg` instead of `user.coverImg`
        // Corrected to delete `user.coverImg` if it exists.
        const publicId = user.coverImg?.split("/").pop()?.split(".")[0];

        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      }

      const uploaded = await cloudinary.uploader.upload(coverImg);
      user.coverImg = uploaded.secure_url;
    }

    // Update other user fields if they are provided in the request body
    user.fullName = fullName || user.fullName; // Use new value if provided, otherwise keep existing
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    // Note: profileImg and coverImg are already updated above if new files were uploaded.
    // These lines ensure they are correctly set even if the previous Cloudinary logic wasn't hit
    // (e.g., if the user is sending profileImg as a string URL instead of a file for some reason, though typical flow is file upload)
    // user.profileImg = profileImg || user.profileImg; // This line might be redundant if profileImg is always a new upload data
    // user.coverImg = coverImg || user.coverImg;     // This line might be redundant if coverImg is always a new upload data

    // Save the updated user document to the database
    const updatedUser = await user.save();

    // Convert the Mongoose document to a plain JavaScript object
    const userObject = updatedUser.toObject() as Partial<typeof updatedUser>;

    // Delete the password field from the object before sending it in the response for security
    delete userObject.password;

    // Send the updated user object (without password) in the response
    return res.status(200).json(userObject);
  } catch (error: any) {
    // Log and send a generic internal server error for any unexpected issues
    console.error("Error in updateUser:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
