import User from "../models/User.model.js";
import Complains from "../models/Complains.model.js";

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
            if(category==="all"){
            }else{
            filter.category = category;
            }
        }
        
        if (status) {
            if(status==="all"){
            }else{
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
    comment
}) => {
    const complain = await Complains.findOne({complainId});
    if (!complain) throw new Error("No complain found!");

    complain.status = status;
    complain.comment = comment;

    const updatedComplain = await complain.save();

    return updatedComplain;
}
