import User from "../models/User.model.js";
import Complains from "../models/Complains.model.js";
import transporter from "../config/mailer.js";
import Otp from "../models/Otp.model.js";

const calculatePercentageChange = (previous, current) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
};

export const adminAnalytics = async () => {
    try {
        const allUsers = await User.find().sort({ createdAt: -1 });
        const totalUsers = allUsers.length;

        const allCases = await Complains.find().sort({ createdAt: -1 });
        const totalCases = allCases.length;

        const totalResolvedCases = allCases.filter(
            (complaint) => complaint.status === "Resolved"
        )?.length;

        const today = new Date();
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        const lastMonthStart = new Date(lastMonthEnd.getFullYear(), lastMonthEnd.getMonth(), 1);

        const lastMonthCases = allCases.filter(
            (complaint) => complaint.createdAt >= lastMonthStart && complaint.createdAt <= lastMonthEnd
        );
        const lastMonthCasesCount = lastMonthCases.length;

        const lastMonthResolvedCases = lastMonthCases.filter(
            (complaint) => complaint.status === "Resolved"
        );
        const lastMonthResolvedCasesCount = lastMonthResolvedCases.length;

        const lastMonthUsers = allUsers.filter(
            (user) => user.createdAt >= lastMonthStart && user.createdAt <= lastMonthEnd
        );
        const lastMonthUsersCount = lastMonthUsers.length;

        const percentageOfTotalCasesLastMonth = (lastMonthCasesCount / totalCases) * 100;
        const percentageOfResolvedCasesLastMonth = lastMonthResolvedCasesCount > 0
            ? (lastMonthResolvedCasesCount / lastMonthCasesCount) * 100
            : 0;
        const percentageOfTotalUsersLastMonth = (lastMonthUsersCount / totalUsers) * 100;

        return {
            totalUsers,
            totalCases,
            lastMonthCasesCount,
            totalResolvedCases,
            lastMonthResolvedCasesCount,
            lastMonthUsersCount,
            percentageOfTotalCasesLastMonth: parseFloat(percentageOfTotalCasesLastMonth.toFixed(2)),
            percentageOfResolvedCasesLastMonth: parseFloat(percentageOfResolvedCasesLastMonth.toFixed(2)),
            percentageOfTotalUsersLastMonth: parseFloat(percentageOfTotalUsersLastMonth.toFixed(2))
        };
    } catch (error) {
        console.error("Error fetching admin analytics:", error);
        throw new Error("Error fetching admin analytics data.");
    }
};

export const getComplains = async ({
    complainId,
    category,
    status,
}) => {
    try {
        const filter = {};

        if (complainId) {
            filter.complainId = { $regex: complainId, $options: "i" };
        }

        if (category) {
            if (category === "all") {
            } else {
                filter.category = category;
            }
        }

        if (status) {
            if (status === "all") {
            } else {
                filter.status = status;
            }
        }
        console.log("test", status, complainId, category)

        const complains = await Complains.find(filter).sort({ createdAt: -1 });

        return complains;
    } catch (error) {
        console.error("Error fetching complains:", error);
        throw new Error("Failed to fetch complains data.");
    }
};

export const updateComplain = async ({
    complainId,
    status,
    comment,
  }) => {
    const complain = await Complains.findOne({ complainId });
    if (!complain) throw new Error("No complaint found!");
  
    const user = await User.findById(complain.userId);
    if (!user) throw new Error("No user found!");
  
    complain.status = status;
    complain.comment = comment;
  
    const updatedComplain = await complain.save();
    if (!updatedComplain) throw new Error("Failed to update complaint!");
  
    await transporter.sendMail({
      from: '"CyberTrinetra Support" <support@cybertrinetra.com>',
      to: user.email,
      subject: `Complaint Status Updated - ${complainId}`,
      html: `
        <html>
          <head>
            <style>
              body {
                font-family: 'Segoe UI', sans-serif;
                background-color: #fafafa;
                color: #333;
              }
              .container {
                max-width: 600px;
                margin: auto;
                background: #fff;
                padding: 25px;
                border-radius: 10px;
                border: 1px solid #ddd;
              }
              .logo {
                text-align: center;
                margin-bottom: 20px;
              }
              .logo img {
                height: 50px;
              }
              .title {
                font-size: 20px;
                color: #0d47a1;
                margin-bottom: 10px;
                font-weight: bold;
              }
              .content {
                font-size: 16px;
                line-height: 1.6;
              }
              .status {
                font-weight: bold;
                color: #2e7d32;
              }
              .note {
                background: #fff3cd;
                padding: 10px;
                border-left: 4px solid #ffcc00;
                margin-top: 25px;
                font-size: 14px;
              }
              .footer {
                margin-top: 30px;
                font-size: 13px;
                text-align: center;
                color: #999;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="logo">
                <img src="https://complains03.s3.ap-south-1.amazonaws.com/logo.jpeg" alt="CyberTrinetra Logo" />
              </div>
              <div class="title">Complaint Status Updated</div>
              <div class="content">
                Hello <strong>${user.name || "User"}</strong>,<br><br>
                We would like to inform you that the status of your complaint with the ID <strong>${complainId}</strong> has been updated.<br><br>
                <strong>Current Status:</strong> <span class="status">${status}</span><br>
                <strong>Remarks:</strong> ${comment || "No additional remarks"}<br><br>
                You can track this complaint anytime using the “Check Case Status” section on our portal with your Complaint ID.
                <div class="note">
                  🔐 <strong>Note:</strong> For your safety, never share your login credentials, passwords, or personal information. CyberTrinetra will never request such information via email, call, or SMS.
                </div><br>
                Regards,<br>
                CyberTrinetra Support Team
              </div>
              <div class="footer">
                © 2025 CyberTrinetra. All rights reserved.
              </div>
            </div>
          </body>
        </html>
      `,
    });
  
    return updatedComplain;
  };
  
export const userDetails = async({
  userId
}) =>{
  try {
    const admin = await User.findById(userId)
    if(admin?.role !== "admin"){
      throw new Error("Please login with admin account")
    }
    const allUsers = await User.find().sort({createdAt: -1})
    if(!allUsers){
      throw new Error("No users found")
    }
    return allUsers;
  } catch (error) {
    throw new Error("No users found "+error)
  }
}

export const deleteuserDetails = async ({
  consumerId
}) => {
  try {
    
    const deletedUser = await User.findByIdAndDelete(consumerId);

    if (!deletedUser) {
      throw new Error("Failed to delete user");
    }

    return { message: "User deleted successfully", deletedUser };
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Error deleting user: " + error.message);
  }
};

export const sendOtpForLogin = async ({ email }) => {
    try {
        const user = await User.findOne({ email })
        if(!user) throw new Error("User not found")
        if(user.role !== "admin") throw new Error("Please login with admin account")
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