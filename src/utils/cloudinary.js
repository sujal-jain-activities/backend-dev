import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'
import dotenv from "dotenv"

dotenv.config()
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})
const uploadOnCloudinary = async(localFilepath)=>{
    try {
        if(!localFilepath) return null;
        // uploading file to cloudinary
        const responce = await cloudinary.uploader.upload(localFilepath,{
            resource_type: 'auto',
        })
        fs.unlinkSync(localFilepath)
        return responce        // file uploaded successfully
        console.log("File uploaded successfully")
    } catch (error) {
        fs.unlinkSync(localFilepath) // delete the file from local storage
        console.error("Error uploading file to Cloudinary:", error);
        return null; // return null if there is an error
    }
}

export default uploadOnCloudinary; 