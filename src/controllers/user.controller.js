import { registerUser, loginUser, getUserById, updateUserDetails, sendOtp, forgetPassword, sendOtpForRegister, verifyOtp } from "../services/user.service.js";

export const registerUserController = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;
        if (!name) throw new Error("Name is required");
        if (!email) throw new Error("Email is required");
        if (!password) throw new Error("Password is required");
        if (!phone) throw new Error("Phone is required");

        const response = await registerUser({ name, email, password, phone });
        res.status(200).json({ success: true, message: 'User registered successfully', user: response });
    } catch (error) {
        next(error);
    }
}

export const loginUserController = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email) throw new Error("Email is required");
        if (!password) throw new Error("Password is required");
        const response = await loginUser({ email, password });
        console.log(response);
        res.status(200).json({ success: true, message: 'User logged in successfully', user: response });
    } catch (error) {
        next(error);
    }
}

export const getUserByIdController = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        if (!userId) throw new Error("User ID is required");
        const response = await getUserById({ userId });
        res.status(200).json({ success: true, message: 'User logged in successfully', user: response });
    } catch (error) {
        next(error);
    }
}

export const updateUserController = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        if (!userId) throw new Error("User ID is required");

        const updateData = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
        };

        const response = await updateUserDetails({ userId, updateData });

        res.status(200).json({ success: true, message: 'User details updated successfully', user: response });
    } catch (error) {
        next(error);
    }
};

export const sendOtpController = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) throw new Error("Email is required");
        const response = await sendOtp({ email });
        res.status(200).json({ success: true, message: 'OTP sent successfully', user: response });
    } catch (error) {
        next(error);
    }
}

export const forgetPasswordController = async (req, res, next) => {
    try {
        const { email, otp, password } = req.body;
        if (!email) throw new Error("Email is required");
        if (!otp) throw new Error("OTP is required");
        if (!password) throw new Error("Password is required");

        const response = await forgetPassword({ email, otp, password });
        res.status(200).json({ success: true, message: 'Password updated successfully', user: response });
    } catch (error) {
        next(error);
    }
}

export const sendOtpForRegisterController = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) throw new Error("Email is required");
        const response = await sendOtpForRegister({ email });
        res.status(200).json({ success: true, message: 'OTP sent successfully', user: response });
    } catch (error) {
        next(error);
    }
}

export const verifyOtpRegisterController = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        if (!email) throw new Error("Email is required");
        if (!otp) throw new Error("OTP is required");
        const response = await verifyOtp({ email, otp });
        res.status(200).json({ success: true, message: 'OTP verified successfully', user: response });
    } catch (error) {
        next(error);
    }
}
