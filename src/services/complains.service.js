import mongoose from "mongoose";
import Complains from "../models/Complains.model.js";
import { uploadToS3 } from "../config/aws.js";
import transporter from "../config/mailer.js";
import User from "../models/User.model.js";

export const registerComplain = async ({
    userId,
    category,
    approxDate,
    description,
    complain,
    extraDoc
}) => {
    const firUrl = await uploadToS3(complain);
    let extraDocUrl = '';
    if (extraDoc) {
        extraDocUrl = await uploadToS3(extraDoc);
    }

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found!");

    const userEmail = user.email;
    const userName = user.name || 'User';

    const lastComplain = await Complains.findOne({}, {}, { sort: { createdAt: -1 } });
    let complainId;

    if (lastComplain) {
        const lastId = parseInt(lastComplain?.complainId?.substring(2)) || 0;
        complainId = `CS${(lastId + 1).toString().padStart(5, '0')}`;
    } else {
        complainId = "CS00001";
    }

    const newComplain = await Complains.create({
        userId: new mongoose.Types.ObjectId(userId),
        complainId,
        category,
        approxDate,
        description,
        firUrl,
        supportingDocUrl: extraDocUrl ?? ""
    });

    if (!newComplain) throw new Error("Error uploading complain");

    try {
        // 1️⃣ Email to user
        await transporter.sendMail({
            from: '"CyberTrinetra Admin" <support@cybertrinetra.com>',
            to: userEmail,
            subject: `Complaint Registered Successfully - ${complainId}`,
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; background: #ffffff; padding: 25px; border-radius: 10px; border: 1px solid #ddd;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="https://complains03.s3.ap-south-1.amazonaws.com/logo.jpeg" alt="CyberTrinetra Logo" height="50" />
                    </div>
                    <h2 style="color: #0d47a1;">Complaint Registered Successfully!</h2>
                    <p>Dear <strong>${userName}</strong>,</p>
                    <p>Thank you for reaching out to <strong>CyberTrinetra</strong>. We’ve successfully registered your complaint with the following details:</p>
                    <ul>
                        <li><strong>Complaint ID:</strong> ${complainId}</li>
                        <li><strong>Category:</strong> ${category}</li>
                        <li><strong>Description:</strong> ${description}</li>
                    </ul>
                    <p>You can track your complaint status using the Complaint ID on our portal under the “Check Case Status” section.</p>
                    <div style="background: #fff3cd; padding: 10px; border-left: 4px solid #ffcc00; margin-top: 20px;">
                        🔐 <strong>Note:</strong> Please do not share your credentials, passwords, UPI IDs, or personal information with anyone. CyberTrinetra will never ask for such details.
                    </div>
                    <p style="margin-top: 25px;">Regards,<br/>CyberTrinetra Support Team</p>
                    <div style="font-size: 12px; text-align: center; color: #aaa; margin-top: 30px;">
                        © 2025 CyberTrinetra. All rights reserved.
                    </div>
                </div>
            `
        });
        await transporter.sendMail({
            from: '"CyberTrinetra Support" <support@cybertrinetra.com>',
            to: ['admin@cybertrinetra.com', 'svrohith248@gmail.com', 'prahisree@gmail.com'],
            subject: `New Complaint Submitted - ${complainId}`,
            html: `
                <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; background: #ffffff; padding: 25px; border-radius: 10px; border: 1px solid #ddd;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="https://complains03.s3.ap-south-1.amazonaws.com/logo.jpeg" alt="CyberTrinetra Logo" height="50" />
                    </div>
                    <h2 style="color: #0d47a1;">New Complaint Received</h2>
                    <p>Hello Admin,</p>
                    <p>A new complaint has been submitted on the CyberTrinetra portal. Details are as follows:</p>
                    <ul>
                        <li><strong>Complaint ID:</strong> ${complainId}</li>
                        <li><strong>User:</strong> ${userName} (${userEmail})</li>
                        <li><strong>Category:</strong> ${category}</li>
                        <li><strong>Description:</strong> ${description}</li>
                    </ul>
                    <div style="background: #fff3cd; padding: 10px; border-left: 4px solid #ffcc00; margin-top: 20px;">
                        🔐 <strong>Reminder:</strong> Handle user complaints with confidentiality and do not disclose any information externally.
                    </div>
                    <p style="margin-top: 25px;">Regards,<br/>CyberTrinetra Notification System</p>
                    <div style="font-size: 12px; text-align: center; color: #aaa; margin-top: 30px;">
                        © 2025 CyberTrinetra Internal System
                    </div>
                </div>
            `
        });

        console.log('✅ Emails sent to user and admin successfully');
    } catch (error) {
        console.error('❌ Failed to send one or more emails:', error);
    }

    return newComplain;
};


export const getAllComplain = async ({
    userId,
}) => {
    console.log("use", userId)
    const allComplains = await Complains.find({ userId: userId }).sort({ createdAt: -1 });

    if (!allComplains) throw new Error("No complains found");

    return allComplains;
}

export const getComplainByComplainId = async ({
    userId,
    complainId
}) => {
    try {
        const complain = await Complains.findOne({ userId, complainId: complainId });
        if (!complain) throw new Error("No complain found!")
        return complain;
    } catch (error) {
        console.error("Error retrieving complain:", error);
        throw error
    }
};
