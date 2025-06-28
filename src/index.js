import express from "express";
import connectDb from "./db/index.js"; // adjust the path as needed
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.get("/",(req,res)=>{
    res.send("Hello World!");
})
// Connect to MongoDB
connectDb();

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
