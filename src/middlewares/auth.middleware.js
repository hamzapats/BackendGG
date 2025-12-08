import asyncHandler from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";


export const verifyJWT = asyncHandler(async (req,res,next) => {
  try {
    // cookies hai toh get accessToken directy, nahi hai toh get it from the
    // Authorization header (Bearer <Token>)!! by replacing this ("Bearer ") with space ("")
    const token = req.cookies?.accessToken || req.headers("Authorization")?.replace("Bearer ","")
  
    if(!token){ throw new ApiError(401,"Unauthorized req., token missing") }
  
    const decodedToken = await jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
  
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    if(!user){ throw new ApiError(401,"Invalid access Token") }
  
    req.user = user; // creating a new obj in user called "user" for future use
    
    next();
  } 
  catch (error) { throw new ApiError(401,error.message || "Invalid access Token") }

});
