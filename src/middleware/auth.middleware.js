import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.models.js";


export const verifyJWT = asyncHandler(async(req,res,next)=>{
    try {
        const token = req.cookies?.AccessToken || req.header("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(400,"Unaauthorized request")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECREAT)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken") 
    
        if (!user) {
            throw new ApiError(400,"Invalid Access Token")
        }
            req.user = user
            next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid Access token")
    }
    
})