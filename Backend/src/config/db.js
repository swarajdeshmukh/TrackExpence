import mongoose from "mongoose";

export async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI)
       console.log("MongoDB connected.")
    } catch (err) {
        console.error("Database connection error:", err.message)
        process.exit(1) //Stop app if db fails
    }
  
}
