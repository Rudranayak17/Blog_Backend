import express from "express";
import {
  deleteUser,
  forgetPassword,
  getAllUserDetails,
  getUserDetails,
  login,
  logout,
  register,
  resetpassword,
  singleUser,
  updateUserRoles,
  updatedPassword,
  updatedProfile,
} from "../controller/user.js";
import {
  authorizeRoles,
  isAuthenticated,
} from "../middleware/isAuthentication.js";
import upload from "../middleware/multer.js";
const router = express.Router();

router.route("/register").post(upload.single("avatar"),register);
router.route("/login").post(login);
router.route("/forgetpassword").post(forgetPassword);

router.route("/resetpassword").put(resetpassword);


router
  .route("/admin/users")
  .get(isAuthenticated, authorizeRoles("admin"), getAllUserDetails);
router
  .route("/admin/user/:id")
  .get(isAuthenticated, authorizeRoles("admin"), singleUser)
  .put(isAuthenticated, authorizeRoles("admin"), updateUserRoles)
  .delete(isAuthenticated, authorizeRoles("admin"), deleteUser);
router.route("/me").get(isAuthenticated, getUserDetails);
router.route("/updateprofile").put(isAuthenticated,upload.single("avatar"), updatedProfile);
router.route("/updatepassword").put(isAuthenticated, updatedPassword);
router.route("/logout").get(logout);

export default router;
