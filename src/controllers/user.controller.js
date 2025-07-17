import {asyncHandler} from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
import { User } from "../models/user.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";

// get user details from frontend
// validation - not empty
// check if user already exists: username, email
// check for images, check for avatar
// upload them to cloudinary, avatar
// create user object - create entry in db
// remove password and refresh token field from response
// check for user creation
// return res

const userRegister = asyncHandler(async(req,res)=>{

    const {fullName , email , password , username} = req.body
    console.log("email:", email)

    if(
        [fullName , email , password , username].some((field)=>
            field?.trim() === "" ))
        {
            throw new ApiError(400,"all fields are required")
        }



const existedUser = User.findOne({
    $or: [{ username },{ email }]
})

if(existedUser){
    throw new ApiError(409,"User with emailId or username already existed")
}

const avatarLocalPath = req.files?.avatar[0]?.path;
const coverImgLocalPath = req.files?.coverImg[0]?.path

if(!avatarLocalPath){
    throw new ApiError(404,"Avatar Image is required")
}

const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImg = await uploadOnCloudinary(coverImgLocalPath)

if(!avatar){
    throw new ApiError(404,"Avatar Image is required")
}

const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImg:coverImg?.url || "",
    username: username.toLowerCase(),
    email,
    password,
})

const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
)
if(!createdUser){
    throw new ApiError(500,"something went wrong! while registering user")
}

res.status(201).json(
    new ApiResponse(200,createdUser,"User registered Successfully!")
)

})
export {userRegister}