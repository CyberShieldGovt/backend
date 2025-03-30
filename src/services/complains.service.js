import mongoose from "mongoose";
import Complains from "../models/Complains.model.js";
import { uploadToS3 } from "../config/aws.js";

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
        extraDocUrl = await uploadToS3(extraDoc)
    }
    console.log("s3url", firUrl, extraDocUrl)
    const lastComplain = await Complains.findOne({}, {}, { sort: { 'createdAt': -1 } });
    let complainId;

    if (lastComplain) {
        const lastId = parseInt(lastComplain?.complainId?.substring(2));
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
    })

    if (!newComplain) throw new Error("Error uploading complain");
    return newComplain
}

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
        if(!complain) throw new Error("No complain found!")
        return complain;
    } catch (error) {
        console.error("Error retrieving complain:", error);
        throw error
    }
};