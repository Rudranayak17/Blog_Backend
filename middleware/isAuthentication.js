import jwt from "jsonwebtoken";
import { catchAsyncFunc } from "./catchAsycFunc.js";
import User from "../model/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";



export const isAuthenticated =catchAsyncFunc(async(req,res,next)=>{

  const { token } = req.cookies;

  if (!token) {
    console.log("Token is missing");
    return next(new ErrorHandler("Please login to access this resource", 401));
  }

  try {
    const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decodedData.id);

    if (!req.user) {
      console.log("User not found");
      return next(new ErrorHandler("User not found", 401));
    }

    next();
  } catch (error) {
    console.error("JWT verification error: ", error);
    return next(new ErrorHandler("Invalid token", 401));
  }


})
export const authorizeRoles=(...roles)=>{

    return(req,res,next)=>{
        if (!roles.includes(req.user.role)) {
           return next( new ErrorHandler(`Role : ${req.user.role} is not authorized to access this resource`,403))
        }
        next();
    }
    
    }