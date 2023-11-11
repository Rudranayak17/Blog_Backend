import mongoose from "mongoose";

const connectDB=async()=>{
    try {
        const {connection}=await mongoose.connect(process.env.MONGO_URL,{
            dbName:"BlogApi"
        })
        console.log(`mongoDB connected to ${connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1)
    }
}
export default connectDB