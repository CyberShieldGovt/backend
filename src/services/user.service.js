import User from "../models/User.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Otp from "../models/Otp.model.js";
import transporter from "../config/mailer.js";

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

export const sendOtp = async ({ email }) => {
    try {
        const user = await User.findOne({ email})
        if(!user) throw new Error("User not found")
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const existingOtp = await Otp.findOne({ email });
        if (existingOtp) {
            existingOtp.otp = otp;
            await existingOtp.save();
        } else {
            await Otp.create({ email, otp });
        }
        await transporter.sendMail({
            from: '"CyberTrinetra Admin" <admin@cybertrinetra.com>',
            to: email,
            subject: "Your OTP for CyberTrinetra",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #2d3748;">CyberTrinetra Verification</h2>
                <p>Hi there,</p>
                <p>We received a request to verify your email for CyberTrinetra.</p>
                <p>Please use the following One-Time Password (OTP) to complete your verification:</p>
                <div style="font-size: 32px; font-weight: bold; color: #3182ce; margin: 20px 0;">${otp}</div>
                <p>This OTP is valid for the next 5 minutes. Please do not share it with anyone.</p>
                <p>If you did not request this, you can safely ignore this email.</p>
                <br />
                <p>Best regards,<br/>CyberTrinetra Admin Team</p>
              </div>
            `,
          });
        return otp;
    } catch (error) {
        console.error("Error in sending OTP:", error);
        throw new Error(error);
    }
}

export const forgetPassword = async ({ email, otp, password }) => {
    try{
        const otpData = await Otp.findOne({ email });
        if (!otpData) {
            throw new Error("No OTP found for this email");
        }
        console.log("otpData", otpData, otp)
        const isOtpCorrect = otpData.otp === otp;
        if (!isOtpCorrect) {
            throw new Error("Invalid OTP");
        }

        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("User not found");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        await user.save();

        await Otp.findByIdAndDelete(otpData._id);

        return user;
    }catch (error) {
        console.error("Error in forget password:", error);
        throw new Error(error);
    }
}

export const sendOtpForRegister = async ({ email }) => {
    try {
        const user = await User.findOne({ email })
        if(user) throw new Error("User already exists")
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const existingOtp = await Otp.findOne({ email });
        if (existingOtp) {
            existingOtp.otp = otp;
            await existingOtp.save();
        } else {
            await Otp.create({ email, otp });
        }
        await transporter.sendMail({
            from: '"CyberTrinetra Admin" <admin@cybertrinetra.com>',
            to: email,
            subject: "Your OTP for CyberTrinetra",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                <h2 style="color: #2d3748;">CyberTrinetra Verification</h2>
                <p>Hi there,</p>
                <p>We received a request to verify your email for CyberTrinetra.</p>
                <p>Please use the following One-Time Password (OTP) to complete your verification:</p>
                <div style="font-size: 32px; font-weight: bold; color: #3182ce; margin: 20px 0;">${otp}</div>
                <p>This OTP is valid for the next 5 minutes. Please do not share it with anyone.</p>
                <p>If you did not request this, you can safely ignore this email.</p>
                <br />
                <p>Best regards,<br/>CyberTrinetra Admin Team</p>
              </div>
            `,
          });
        return otp;
    } catch (error) {
        console.error("Error in sending OTP:", error);
        throw new Error(error);
    }
}

export const verifyOtp = async ({ email, otp }) => {
    try{
        const otpData = await Otp.findOne({ email });
        if (!otpData) {
            throw new Error("No OTP found for this email");
        }
        const isOtpCorrect = otpData.otp === otp;
        if (!isOtpCorrect) {
            throw new Error("Invalid OTP");
        }

        await Otp.findByIdAndDelete(otpData._id);

        return true;
    }catch (error) {
        console.error("Error in verify otp:", error);
        throw new Error(error);
    }
}
