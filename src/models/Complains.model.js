import mongoose from "mongoose";

const ComplainSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true,
    },
    complainId:{
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        index: true
    },
    approxDate: {
        type: Date,
        required: true,
    },
    description: {
        type: String,
        requried: true
    },
    firUrl: {
        type: String,
        requried: true
    },
    supportingDocUrl: {
        type: String,
        requried: false
    },
    status:{
        type: String,
        required: true,
        default: "new"
    },
    comment: {
        type: String,
        required: false
    }
}, {timestamps: true} )

const Complains = mongoose.model('complain', ComplainSchema);
  
export default Complains;