import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.route.js";

dotenv.config();

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Database is connected");
    })
    .catch((err) => {
        console.log(err);
    });

const app = express();

// middleware to handle cors
app.use(
    cors({
        origin: process.env.FRONT_END_URL || "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Middleware to handle JSON object
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

app.listen(3000, () => {
    console.log("server is running on port 3000");
});
