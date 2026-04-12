import  exp from 'express'
import {UserModel} from '../models/UserModel.js'
import { hash, compare } from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {config} from 'dotenv';
import { verifyToken } from '../middlewares/VerifyToken.js';
const {sign}=jwt
export const commonApp = exp.Router()
import { upload } from '../config/multer.js';
import {uploadToCloudinary} from "../config/cloudinaryUpload.js"
import cloudinary from '../config/cloudinary.js';
config();

//Route for register
commonApp.post("/users", upload.single("profileImageUrl"), async (req, res) => {
    let cloudinaryResult
    try 
    {
    let allowedRoles = ["USER", "AUTHOR"];
    // Get user from req
    const newUser = req.body;
    console.log(newUser);
    console.log(req.file);

    //check role
    if (!allowedRoles.includes(newUser.role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Upload image to cloudinary from memoryStorage
    if (req.file) 
    {
      cloudinaryResult = await uploadToCloudinary(req.file.buffer);
    }

    // Add CDN link(secure_url) of image to newUserObj
    newUser.profileImageUrl = cloudinaryResult?.secure_url;

    //run validators manually
    //hash password and replace plain with hashed one
    newUser.password = await hash(newUser.password, 12);

    //create New user document
    const newUserDoc = new UserModel(newUser);

    //save document
    await newUserDoc.save();
    //send res
    res.status(201).json({ message: "User created" });
        
    } 
    catch (err) 
    {
    //delete image from cloudinary
    if (cloudinaryResult.public_id) 
    {
      await cloudinary.uploader.destroy(cloudinaryResult.public_id);
    }
    next(err)
   }
});

//Route for login (USER,AUTHOR AND ADMIN)
commonApp.post("/login",async(req,res)=>{
    //get user cred obj
    const {email,password}=req.body
    //find user by email
    const user=await UserModel.findOne({email:email})
    //if user notfound
    if(!user){
        return res.status(400).json({message:"Invalid email"})
    }
    //compare passwords
    const isMatched=await compare(password,user.password)
    //if passwords not matched
    if(!isMatched){
        return res.status(400).json({message:"Invalid password"})
    }
    //create jwt
    const signedToken = sign(
    {
        id:user._id,
        email:email,
        role:user.role,
        firstName:user.firstName,
        lastName:user.lastName,
        profileImageUrl:user.profileImageUrl
    },
    process.env.SECRET_KEY,
    {
        expiresIn:"1h"
    }
   )
    //set token to res header as httpOnly cookie
    res.cookie("token",signedToken,{
        httpOnly:true,
        secure:false,
        sameSite:"lax"
    })
    //remove password from user document
    let userObj=user.toObject()
    delete userObj.password
    //send response
    res.status(200).json({message:"Login successful",payload:userObj}) //payload is required to know the current user
})

//Route for Logout
commonApp.get("/logout",(req,res)=>{
    //delete token from cookie storage
    res.clearCookie("token",{
        httpOnly:true,
        secure:false,
        sameSite:"lax"
    })
    //send res
    res.status(200).json({message:"Logout successful"})
})
//Page refresh
commonApp.get("/check-auth", verifyToken("USER", "AUTHOR", "ADMIN"), (req, res) => {
  res.status(200).json({
    message: "authenticated",
    payload: req.user,
  });
});

//Change password
commonApp.put('/password',verifyToken("USER","AUTHOR","ADMIN"),async(req,res)=> {
    //Get current and new password from request body
    const {currentPassword,newPassword} = req.body
    // No change if both are same
    if(currentPassword === newPassword) {
        return res.status(400).json({message:"Current password and New password shouldn't be the same"})
    }

    //Next find if user typed password and password in db matches
    //Get user from db
    const user = await UserModel.findById(req.user.id)
    //Check if both matches
    const isMatched = await compare(currentPassword,user.password)
    if(!isMatched){
        return res.status(400).json({message:"Current password is incorrect"})
    }
    // Hash the new updated password
    const hashedPassword = await hash(newPassword,12)
    // Replace old password with new hashed password
    user.password = hashedPassword
   // Save 
    await user.save()
   // Send response 
    res.status(200).json({message:"Password updated successfully"})
})