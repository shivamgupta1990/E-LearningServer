import express from "express";
import dotenv from "dotenv";
import connectDB from "./database/dbConnect.js";
import userRoute from "./routes/user.js"
import cookieParser from "cookie-parser";
import cors from "cors";
import courseRoute from "./routes/course.js";
import mediaRoute from "./routes/media.js";
import purchaseRoute from "./routes/purchaseCourse.js";
import bodyParser from "body-parser";
import { stripeWebhook } from "./controllers/coursePurchase.js";
import courseProgressRoute from "./routes/courseProgress.js";

const app=express();
dotenv.config({});

// app.post("/api/v1/purchase/webhook", express.raw({ type: "application/json" }), stripeWebhook);
app.use("/api/v1/purchase/webhook", purchaseRoute);
//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:3000",
    credentials:true,
}));

//DataBase connect
connectDB();

const PORT=process.env.PORT || 5000;


//apis
app.use("/api/v1/user",userRoute); 
app.use("/api/v1/course",courseRoute); 
app.use("/api/v1/media",mediaRoute);
app.use("/api/v1/purchase",purchaseRoute);
app.use("/api/v1/progress",courseProgressRoute);
//default route
app.get("/",(req,res)=>{
    res.send("Default page");
})

//Connect Server
app.listen(PORT,()=>{
    console.log(`server runing at port ${PORT}`);
})





// use this command at time of puchase course  ->    stripe listen --forward-to localhost:4000/api/v1/purchase/webhook