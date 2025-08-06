import mongoose, { mongo } from "mongoose";
const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Database Connected");
    }catch(err){
        console.log("DB connection failed ",err);
    }
};

export default connectDB;