import { adminAnalytics, getComplains, updateComplain } from "../services/admin.services.js";

export const adminAnalyticsController = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        if (!userId) throw new Error("User ID is required");

        const response = await adminAnalytics()

        res.status(200).json({ success: true, message: 'Analytics fetched successfully', admin: response });
    } catch (error) {
        next(error);
    }
};

export const getComplainsController = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        if (!userId) throw new Error("User ID is required");

        const { complainId, category, status } = req.query

        const response = await getComplains({complainId, category, status})

        res.status(200).json({ success: true, message: 'Complains fetched successfully', admin: response });
    } catch (error) {
        next(error);
    }
};

export const updateComplainController = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        if (!userId) throw new Error("User ID is required");

        const { complainId, comment, status } = req.body

        if(!complainId) throw new Error("Complain id is required")

        const response = await updateComplain({complainId, comment, status})

        res.status(200).json({ success: true, message: 'Complains fetched successfully', admin: response });
    } catch (error) {
        next(error);
    }
};

