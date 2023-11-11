import { catchAsyncFunc } from "../middleware/catchAsycFunc.js";
import User from "../model/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendMail } from "../utils/sendMail.js";
import sendToken from "../utils/sendToken.js";
import bcrypt from "bcrypt";
import cloudinary from "cloudinary";
import fs from "fs";

//registeration of user

export const register = catchAsyncFunc(async (req, res, next) => {
  const { email, password, name } = req.body;
  const avatar=req.file.path

  let user = await User.findOne({ email });

  if (user) {
    return next(new ErrorHandler(`user already registered`, 400));
  }

  const myCloud=await cloudinary.v2.uploader.upload(avatar,{
    folder:"blogApp"
  })
  fs.unlinkSync(avatar);

  user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });
  sendToken(user, 201, res);
});

// login of user

export const login = catchAsyncFunc(async (req, res, next) => {
  const { email, password } = req.body;
  // const avatar=req.file.avatar

  if (!email || !password) {
    return next(new ErrorHandler(`Enter All the fields`, 400));
  }
  let user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler(`Invalid Email or Password `, 401));
  }
  const ispasswordMatched = await bcrypt.compare(password, user.password);

  if (!ispasswordMatched) {
    return next(new ErrorHandler(` Invalid Email or Password`, 401));
  }
  sendToken(user, 200, res);
});

export const forgetPassword = catchAsyncFunc(async(req,res,next)=>{
  const {email} = req.body;
  if (!email) {
    return next(new ErrorHandler("please enter your email",400))
  }
  const user=await User.findOne({email});
  if (!user) {
    return next(new ErrorHandler("Invaild Email",400))
  }

  const otp=Math.floor(Math.random()*1000000)

  user.resetPasswordOTP=otp;
  user.resetPasswordOTPExpiry=Date.now()+10*60*100;
  await user.save();
  const message = `Your OTP for reseting the password  ${otp}.If you did not request for this ,please ignore this email`;
  await sendMail(email, "Request for Reseting Password", message);
  res.status(200).json({
    success: true,
    message: `OTP Sent to ${email}`
  })
})

export const resetpassword = catchAsyncFunc(async (req, res, next) => {
  const { otp, newpassword } = req.body;
  const user = await User.findOne({
    resetPasswordOTP: otp,
    resetPasswordOTPExpiry: { $gt: Date.now() },
  }).select("+password");
  if (!otp || !newpassword) {
    return next(new ErrorHandler(` please enter all fields`, 400));
  }
  if (!user) {
    return next(new ErrorHandler(` OTP Invaild or has been Expired`, 400));
  }
  user.password = newpassword;
  user.resetPasswordOTP = null;
  user.resetPasswordOTPExpiry = null;
  await user.save();

  res.status(200).json({
    success: true,
    message: `Password Changed Successfully`,
  });
});

//logout

export const logout = catchAsyncFunc(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logout successfully",
  });
});

// get profile indiviual  user details --user

export const getUserDetails = catchAsyncFunc(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({ success: true, user });
});

export const updatedProfile = catchAsyncFunc(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const { name } = req.body;
  const avatar = req.file.path
  if (name) user.name = name;

  if (avatar) {
    await cloudinary.v2.uploader.destroy(user.avatar.public_id, {
      folder: "blogApp",
    });
    const myCloud = await cloudinary.v2.uploader.upload(avatar, {
      folder: "blogApp",
    })
    fs.unlinkSync(avatar);
    user.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }
  await user.save();
  res.status(201).json({ success: true,  message: "profile updated successfully", });
});

// update password

export const updatedPassword = catchAsyncFunc(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  const { oldpassword, newpassword } = req.body;
  if (!oldpassword) {
    return next(new ErrorHandler("plz enter your old Password", 400));
  }
  if (!newpassword) {
    return next(new ErrorHandler("plz enter your new password", 400));
  }
  const ispasswordMatched = await bcrypt.compare(oldpassword, user.password);

  if (!ispasswordMatched) {
    return next(new ErrorHandler("OldPassword is inCorrect", 400));
  }

  user.password = newpassword;

  await user.save();
  sendToken(user, 201, res);
});

// get all user details -- only admin
export const getAllUserDetails = catchAsyncFunc(async (req, res, next) => {
  const user = await User.find();

  if (!user) {
    return next(new ErrorHandler("No User register ", 404));
  }

  res.json({
    success: true,
    user,
  });
});
//get all single User --admin

export const singleUser = catchAsyncFunc(async (req, res, next) => {
  const users = await User.findById(req.params.id);
  if (!users) {
    return next(
      new ErrorHandler(`User doesn't exist with id : ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    users,
  });
});

//Update User Role -Admin
export const updateUserRoles = catchAsyncFunc(async (req, res, next) => {
  const { name, email, role } = req.body;
  const newUserData = {
    name,
    email,
    role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({ success: true });
});

//Delete User -Admin
export const deleteUser = catchAsyncFunc(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  // We will remove cloudinary later
  if (!user) {
    return next(
      new ErrorHandler(`user doesn't exist with id ${req.params.id}`, 400)
    );
  }
  await user.deleteOne();

  res.status(200).json({ success: true, message: "User deleted successfully" });
});
