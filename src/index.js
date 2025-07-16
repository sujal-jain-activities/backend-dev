import express from "express";
import connectDb from "./db/index.js"; // adjust the path as needed
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 8000;

// Connect to MongoDB
connectDb();

app.listen(PORT, () => {
    console.log("Server is running on port",PORT);
});
