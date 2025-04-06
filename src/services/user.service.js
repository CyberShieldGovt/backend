import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async ({
    name,
    email,
    password,
    phone
}) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        phone
    })
    if (!newUser) {
        throw new Error("Error in creating user");
    }
    const token = jwt.sign({ id: newUser?._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return { newUser, token };
}

export const loginUser = async ({
    email,
    password
}) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error("User not found!");
    }
    const MatchedPassword = await bcrypt.compare(password, user?.password);
    console.log(MatchedPassword, user?.password);
    if (!MatchedPassword) {
        throw new Error("Invalid password!");
    }
    const token = jwt.sign({ id: user?._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return { user, token };
}

export const getUserById = async ({
    userId
}) => {
    const user = await User.findById(userId)

    if (!userId) throw new Error("No user found!")
    return user
}

export const updateUserDetails = async ({ 
    userId, 
    updateData 
}) => {
    try {
        const allowedUpdates = {};
        if (updateData.name !== undefined) {
            allowedUpdates.name = updateData.name;
        }
        if (updateData.email !== undefined) {
            allowedUpdates.email = updateData.email;
        }
        if (updateData.phone !== undefined) {
            allowedUpdates.phone = updateData.phone;
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            allowedUpdates,
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            throw new Error("User not found");
        }

        return updatedUser;
    } catch (error) {
        console.error("Error updating user details:", error);
        throw new Error(error);
    }
};

