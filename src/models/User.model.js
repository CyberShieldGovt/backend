import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: "User"
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    password: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        requried: true
    },
    role: {
        type: String,
        required: true,
        default: "user"
    }
}, {timestamps: true} )

const User = mongoose.model('user', UserSchema);
  
export default User;