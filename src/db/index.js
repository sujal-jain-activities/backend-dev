import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDb = async()=>{
    console.log("connectDb() function called"); // <== debug line
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`).catch(err => {
            console.log("Caught from .catch():", err);
            throw err;
          });
    console.log(`\n  MONGODB CONNECTED !! DB HOST : ${connectionInstance.connection.host}`)
    } catch (error) {
        console.log("ERROR:",error)
        process.exit(1);
    }
}
export default connectDb