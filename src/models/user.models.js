import mongoose from "mongoose";
import bcrypt from "bcrypt";
import  jwt  from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    fullName:{
        type:String,
        required:true,
    },
    avatar:{
        type:String,
        required:true,
    },
    coverImg:{
        type:String,
    },
    password:{
        type:String,
        required:true,
    },
    refreshToken:{
        type:String,
    }
},{timestamps:true});

userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password,salt);
    next();
})

userSchema.methods.isPasswordMatched = async function(Password){
    return await bcrypt.compare(Password,this.password);
}

userSchema.methods.generateTokenSecreat = function(){
    return jwt.sign({
        _id:this._id,
        username:this.username,
        email:this.email,
        fullName:this.fullName,
    }),
    process.env.ACCESS_TOKEN_SECREAT,
    {
        expiresIn:ACCESS_TOKEN_EXPIRES,
    }
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign({
        _id:this._id,
    }),
    process.env.REFREASH_TOKEN_SECREAT,
    {
        expiresIn:REFREASH_TOKEN_EXPIRES,
    }
}

export const User = mongoose.model("User", userSchema)