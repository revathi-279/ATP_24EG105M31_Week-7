import { Schema, model } from 'mongoose'

const userSchema = new Schema(
    {
    firstName: {
        type: String,
        required: [true, "First name is required"]
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "Email already exists"]
    },
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    role: {
        type: String,
        enum: ["USER", "AUTHOR", "ADMIN"],
        required: [true, "Invalid role"]
    },
    profileImageUrl:{
        type:String
    },
    isUserActive:{
        type:Boolean,
        default:true
    }

},{
    timestamps:true,
    versionKey:false,
    strict:"throw"
})

//create model
export const UserModel=model("user", userSchema)