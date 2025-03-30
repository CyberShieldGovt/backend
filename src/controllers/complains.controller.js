import { getAllComplain, getComplainByComplainId, registerComplain } from "../services/complains.service.js";

export const registerComplainController = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        if (!userId) throw new Error("User ID is required");
        const { category, approxDate, description } = req.body;

        if (!category) throw new Error("Category is required");
        if (!approxDate) throw new Error("Approx Date is required");
        if (!description) throw new Error("Description is required");

        const complain = req.files.complain[0];
        const extraDoc = req.files.extraDoc[0];

        if (!complain) throw new Error("FIR is required");

        const response = await registerComplain({
            userId,
            category,
            approxDate,
            description,
            complain,
            extraDoc,
        });

        res.status(200).json({ success: true, message: 'Complain registered successfully', complain: response });
    } catch (error) {
        next(error);
    }
};

export const getComplainController = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        if (!userId) throw new Error("User ID is required");

        const response = await getAllComplain({ userId });

        res.status(200).json({ success: true, message: 'Complain Fetched successfully', user: response });
    } catch (error) {
        next(error);
    }
}

export const getComplainByIdController = async (req, res, next) => {
    try {
        const { id: userId } = req.user;
        if (!userId) throw new Error("User ID is required");
        const { complainId } = req.params;
        console.log(complainId, req.query)
        if(!complainId) throw new Error("Complain Id is required!")

        const response = await getComplainByComplainId({ userId, complainId });

        res.status(200).json({ success: true, message: 'Complain Fetched successfully', complain: response });
    } catch (error) {
        next(error);
    }
}