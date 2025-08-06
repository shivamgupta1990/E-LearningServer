import {User} from "../models/user.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";

export const register=async (req,res)=>{
    try{
        const {name,email,password ,role} = req.body;
        if(!name || !email || !password || !role){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }
        
        const user=await User.findOne({email});
        if(user){
            return res.status(400).json({
                success:false,
                message:"User Already Exist.",
            })
        }
        
        const hashedPassword = await bcrypt.hash(password,10);
        await User.create({
            name,email,password:hashedPassword,role
        });
        return res.status(201).json({
            success:true,
            message:"Registration Successfully",
        })
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Failed to register",  
        })
    }
};

//login
export const login= async(req,res)=>{
    try{
        const {email,password}=req.body;
        if(!email || !password){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({
                succes:false,
                message:"Invaild credential",
            })
        }
        const isPasswordMatch= await bcrypt.compare(password,user.password);
        if(!isPasswordMatch){
            return res.status(400).json({
                succes:false,
                message:"Invaild credential",
            })
        }
        console.log("user->",user);
        generateToken(res,user,`welcome back ${user.name}`);
    }catch(err){
        return res.status(500).json({
            success:false,
            message:"Failed to login",  
        })
    }
};

export const logout=async(req,res)=>{
    try{
        return res.status(200).cookie("token","",{maxAge:0}).json({
            success:true,
            message:"Logged out successfully",
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Failed to logout"
        })
    }
}

export const getUserProfile= async(req,res)=>{
    try{
        const userId=req.id;
        const user=await User.findById(userId).select("-password").populate("enrolledCourses");
        if(!user){
            return res.status(404).josn({
                success:false,
                message:"Profile not found"
            })
        }
        return res.status(200).json({
            success:true,
            user
        })
    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Failed to load user",
        })
    }
}

export const updateProfile = async(req,res)=>{
    try{
        const userId=req.id;
        const {name}=req.body;
        const profilePhoto=req.file;

        const user = await User.findById(userId);
        if(!user){
             return res.status(404).josn({
                success:false,
                message:"User not found"
            })
        }
        //extract public id of the old image from the url it exist
        if(user.photoUrl){
            const publicId=user.photoUrl.split("/").pop().split(".")[0]; //extract
            deleteMediaFromCloudinary(publicId);
        }
        //upload new photo
        console.log("profilePhoto.path->",profilePhoto.path);
        const cloudResponse=await uploadMedia(profilePhoto.path);
        console.log("CloudResponse->",cloudResponse);
        const photoUrl=cloudResponse.secure_url;
        const updatedData={name,photoUrl}

        const updatedUser=await User.findByIdAndUpdate(userId,updatedData,{new:true}).select("-password");
        return res.status(200).json({
            success:true,
            user:updatedUser,
            message:"Profile updated Successfully"
        })

    }catch(err){
        console.log(err);
        return res.status(500).json({
            success:false,
            message:"Failed to update profile",
        })
    }
}