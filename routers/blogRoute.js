import express from "express";
import {
  UpdateComment,
  adminAllPost,
  adminAllPostDelete,
  createBlog,
  createComment,
  createReply,
  deleteBlogPost,
  deleteComment,
  deleteReply,
  getAllComments,
  getMyAllBlogs,
  likeCount,
  savePost,
  singleBlogPost,
  updateBlog,
  userAllBlogs,
} from "../controller/blogController.js";
import {
  authorizeRoles,
  isAuthenticated,
} from "../middleware/isAuthentication.js";
import upload from "../middleware/multer.js";
const router = express.Router();

router
  .route("/createblog")
  .post(isAuthenticated, upload.single("blogImg"), createBlog);
router.route("/blogs").get(getMyAllBlogs);
router
  .route("/blog/:id")
  .get(singleBlogPost)
  .post(isAuthenticated, likeCount)
  .put(isAuthenticated, upload.single("blogImg"), updateBlog)
  .delete(isAuthenticated, deleteBlogPost);

router
  .route("/blog/comments/:id")
  .get(isAuthenticated, getAllComments)
  .post(isAuthenticated, createComment)
  .put(isAuthenticated, UpdateComment)
  .delete(isAuthenticated, deleteComment);

router
  .route("/blog/comments/reply/:id")
  .put(isAuthenticated, createReply)
  .delete(isAuthenticated, deleteReply);
router.route("/blog/saved/:id").put(isAuthenticated, savePost);
router.route("/myblog").get(isAuthenticated, userAllBlogs);

//admin routes
router
  .route("/admin/blogs")
  .get(isAuthenticated, authorizeRoles("admin"), adminAllPost)
  .delete(isAuthenticated, authorizeRoles("admin"), adminAllPostDelete);

export default router;
