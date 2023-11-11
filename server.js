import { app } from "./app.js";
import cloudinary from "cloudinary";
import { config } from "dotenv";
import connectDB from "./config/db.js";
config({
    path:"./config/config.env"
})
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET
  })
connectDB()
app.listen(process.env.PORT,()=>{
    console.log(`server  listening on ${process.env.PORT}`);
})