import {asyncHandler} from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
import { User } from "../models/user.models.js";
import uploadOnCloudinary from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefreshToken = async (userId)=>{
    try {
        const user = await User.findById(userId)
        if (!user) {
            throw new ApiError(404, "User not found")
        }
        const AccessToken = user.generateTokenSecreat();
        const RefreshToken = user.generateRefreshToken();

        user.refreshToken = RefreshToken
       await user.save({validateBeforeSave: false})

       return{AccessToken,RefreshToken}
    } catch (error) {
        throw new ApiError(500, "Some think went wrong")
    }
}

// get user details from frontend
// validation - not empty
// check if user already exists: username, email
// check for images, check for avatar
// upload them to cloudinary, avatar
// create user object - create entry in db
// remove password and refresh token field from response
// check for user creation
// return res


// get user details from frontend
const userRegister = asyncHandler(async(req,res)=>{

    const {fullName , email , password , username} = req.body
    // console.log("email:", email)

    if(
        [fullName , email , password , username].some((field)=>
            field?.trim() === "" ))
        {
            throw new ApiError(400,"all fields are required")
        }


// check if user already exists: username, email
const existedUser = await User.findOne({
    $or: [{ username },{ email }]
})

if(existedUser){
    throw new ApiError(409,"User with emailId or username already existed")
}

// check for images, check for avatar
const avatarLocalPath = req.files?.avatar[0]?.path;

// const coverImgLocalPath = req.files?.coverImg[0]?.path
let coverImgLocalPath;
if (req.files && Array.isArray(req.files.coverImg) && req.files.coverImg.length > 0) {
    coverImgLocalPath = req.files.coverImg[0].path
}

if(!avatarLocalPath){
    throw new ApiError(404,"Avatar Image is required")
}

// upload them to cloudinary, avatar
const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImg = await uploadOnCloudinary(coverImgLocalPath)

if(!avatar){
    throw new ApiError(404,"Avatar Image is required")
}

// create user object - create entry in db
const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImg:coverImg?.url || "",
    username: username.toLowerCase(),
    email,
    password,
})

// remove password and refresh token field from response
const createdUser = await User.findById(user._id).select(
    "-password -RefreshToken"
)

// check for user creation
if(!createdUser){
    throw new ApiError(500,"something went wrong! while registering user")
}


return res.status(201).json(
    new ApiResponse(200,createdUser,"User registered Successfully!")
)

})


// req body -> data
// username or email
//find the user
//password check
//access and referesh token
//send cookie
const userLogin = asyncHandler(async (req,res)=>{

        // req body -> data
    const {username,password,email} = req.body

        // username or email
    if(!username && !email){
        throw new ApiError(400,"username or email is required")
    }
        //find the user
    const user = await User.findOne({
        $or :[{username},{email}]
    })
    if (!user) {
        throw new ApiError(404,"user does not exist!")
    }

    //password check
    const isPasswordValid = await user.isPasswordMatched(password)
    if (!isPasswordValid) {
        throw new ApiError(401,"Password is Invalid")
    }

        //access and referesh token
   const {AccessToken,RefreshToken}= await generateAccessAndRefreshToken(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -RefreshToken")

   const option = {
    httpOnly : true,
    secure : true,
   }

   return res
   .status(200)
   .cookie("AccessToken",AccessToken,option)
   .cookie("RefreshToken",RefreshToken,option)
   .json(
    new ApiResponse(
        200,
        {
            user: loggedInUser,AccessToken,RefreshToken
        },
        "user logged in successfully!"
    )
   )
})

const userLogout = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                RefreshToken: undefined,

            }

        },
        {
            new: true,
        }
    )
    const option = {
        httpOnly : true,
        secure : true,
       }
       return res.
       status(200)
       .clearCookie("AccessToken",option)
       .clearCookie("RefreshToken",option)
       .json(new ApiResponse(200,{},"User logged out",))
})

const RefreshAccessToken = asyncHandler(async (req,res)=>{
    const incomingRefreshToken = req.cookies.RefreshToken || req.body.RefreshToken;

    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request")
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFREASH_TOKEN_SECREAT)
    
        const user = User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401,"Invalid Refresh Token")
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
                throw new ApiError(401,"Invalid Refresh Token")}
    
        const option ={
            httpOnly: true,
            secure:true,
        }
        const {AccessToken,newRefreshToken} = generateAccessAndRefreshToken(user._id)
    
        return res.
        status(200).
        cookie("AccessToken",AccessToken,option).
        cookie("RefreshToken",newRefreshToken,option).
        json(
            ApiResponse(200,{AccessToken,refreshToken:newRefreshToken},"Access token Refreshed")
        )
    } catch (error) {
        throw new ApiError(401,error?.message || "Unauhorized Access")
    }
})

export {
    userRegister,
    userLogin,
    userLogout,
    RefreshAccessToken,
}