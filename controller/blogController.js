import { catchAsyncFunc } from "../middleware/catchAsycFunc.js";
import Blog from "../model/blogPostModel.js";
import User from "../model/userModel.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary";
import fs from "fs";
import ApiFeatures from "../utils/apiFeature.js";
//Create a new blog
export const createBlog = catchAsyncFunc(async (req, res, next) => {
  const { title, content, tags } = req.body;
  const blogImg = req.file.path;

  if (!title && !content) {
    return next(new ErrorHandler(`Plz fill all the details`, 400));
  }
  const user = await User.findById(req.user.id);
  if (!user) {
    return next(new ErrorHandler(`user Doesn't Exist`, 400));
  }
  const myCloud = await cloudinary.v2.uploader.upload(blogImg, {
    folder: "blogImgPost",
  });
  fs.unlinkSync(blogImg);

  await Blog.create({
    title,
    content,
    blogImg: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
    tags,
    user,
    username: req.user.name,
    avatar:req.user.avatar.url
  });
  res.status(201).json({
    success: true,
    message: "Task created successfully",
  });
});

//create get All the blog posts by individual user

export const getMyAllBlogs = catchAsyncFunc(async (req, res, next) => {
  const page = req.query.page || 1; // Current page
  const resultPerPage = req.query.resultPerPage || 100; // Items per page
  const blogCount = await Blog.countDocuments();
  const apiFeature = new ApiFeatures(Blog.find(), req.query)
    .search()
    .sort()
    .mostViews()
    .mostLikes()
    .trendingWithinMonth()
    .paginate(page, resultPerPage);
  const allPost = await apiFeature.query;

  res.status(200).json({
    success: true,
    allPost,
    blogCount,
    resultPerPage,
  });
});

//like post only user is Authenticated and like only 1

export const likeCount = catchAsyncFunc(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return next(new ErrorHandler(`Blog not found`, 400));
  }
  const userId = req.user.id;

  if (blog.likedBy.includes(userId)) {
    // If the user has already liked the blog, remove the like
    blog.likes -= 1;
    blog.likedBy = blog.likedBy.filter((id) => id.toString() !== userId);
  } else {
    // If the user has not liked the blog, add the like
    blog.likes += 1;
    blog.likedBy.push(userId);
  }
  await blog.save();
  res.status(200).json({
    success: true,
    message: "Liked successfully",
    likes: blog.likes,
  });
});
//get single single Blog Post and also delete posts
export const singleBlogPost = catchAsyncFunc(async (req, res, next) => {
  let blog = await Blog.findById(req.params.id);
  if (!blog) {
    return next(new ErrorHandler(`Blog not found`, 400));
  }
  blog.views += 1;
  await blog.save();
  res.status(200).json({ success: true, blog });
});

//update post which is already Blog existing

export const updateBlog = catchAsyncFunc(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return next(new ErrorHandler(`Blog not found`, 400));
  }
  const { title, content, tags } = req.body;
  const blogImg = req.file.path;

  if (title || content || tags) {
    blog.title = title;
    blog.content = content;
    blog.tags = tags;
  }
  if (blogImg) {
    await cloudinary.v2.uploader.destroy(blog.blogImg.public_id, {
      folder: "blogImgPost",
    });
    const myCloud = await cloudinary.v2.uploader.upload(blogImg, {
      folder: "blogImgPost",
    });

    fs.unlinkSync(blogImg);
    blog.avatar = {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    };
  }

  await blog.save();

  res
    .status(200)
    .json({ success: true, message: "Updated successfully", blog });
});

//delete blog post which is exist
export const deleteBlogPost = catchAsyncFunc(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return next(new ErrorHandler(`Blog Post Doesn't exist`, 400));
  }

  if (blog.user.toString() !== req.user.id) {
    return next(new ErrorHandler(`Blog cannot be deleted`, 400));
  }
  await blog.deleteOne();

  res.status(201).json({ success: true, message: "Blog deleted successfully" });
});

/// create blog comments

export const createComment = catchAsyncFunc(async (req, res, next) => {
  let blog = await Blog.findById(req.params.id);
  if (!blog) {
    return next(new ErrorHandler(`Blog Post Doesn't exist`, 400));
  }
  const user = req.user.id;
  const { title } = req.body;

  const comment = {
    user,
    name: req.user.name,
    title,
  };
  await blog.comment.push(comment);

  blog.save();

  res.status(201).json({
    success: true,
    message: "comment added successfully",
  });
});

// get all comments in the blog

export const getAllComments = catchAsyncFunc(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) {
    return next(new ErrorHandler(`Blog Post Doesn't exist`, 400));
  }

  const comment = blog.comment;
  res.status(201).json({
    success: true,
    comment,
  });
});

// Update comments int the Blog

export const UpdateComment = catchAsyncFunc(async (req, res, next) => {
  const blogId = req.params.id;
  const user = req.user.id;
  const { commentId, title } = req.body;
  let blog = await Blog.findById(blogId);
  if (!blog) {
    return next(new ErrorHandler(` Post Doesn't exist`, 400));
  }

  // Find the index of the comment to update
  const commentIndex = blog.comment.findIndex(
    (comment) => comment._id.toString() === commentId
  );

  if (commentIndex === -1) {
    return next(new ErrorHandler(`Comment Doesn't exist`, 404));
  }
  const commentUser = blog.comment.find(
    (comment) => comment.user.toString() === user
  );

  if (!commentUser) {
    return next(new ErrorHandler(` you cannot update the comment`, 400));
  }
  blog.comment[commentIndex].title = title;

  await blog.save();
  res.status(201).json({
    success: true,
    message: "comment updated successfully",
    comment: blog.comment[commentIndex], // Return the updated comment
  });
});
export const deleteComment = catchAsyncFunc(async (req, res, next) => {
  const blogId = req.params.id;

  const { commentId } = req.body;
  let blog = await Blog.findById(blogId);
  if (!blog) {
    return next(new ErrorHandler(` Post Doesn't exist`, 400));
  }
  // Find the index of the comment to update
  const commentIndex = blog.comment.findIndex(
    (comment) => comment._id.toString() === commentId
  );
  if (commentIndex === -1) {
    return next(new ErrorHandler(`Comment Doesn't exist`, 404));
  }

  if (
    blog.user.toString() !== req.user.id &&
    blog.comment[commentIndex].user.toString() !== req.user.id
  ) {
    return next(new ErrorHandler(` you cannot delete this comment`, 400));
  }
  // Remove the comment from the comments array
  blog.comment.splice(commentIndex, 1);

  // Save the updated blog post
  await blog.save();

  res.status(201).json({
    success: true,
    message: "comment deleted successfully",
  });
});

// owner of the blog can reply to comments

export const createReply = catchAsyncFunc(async (req, res, next) => {
  const blogId = req.params.id;
  const userId = req.user.id;
  const { title, commentId } = req.body;
  const blog = await Blog.findById(blogId);

  if (!blog) {
    return next(new ErrorHandler(`Post Doesn't exist`, 400));
  }

  // Check if the user making the request is the owner of the blog post
  if (blog.user.toString() !== req.user.id) {
    return next(new ErrorHandler(`You cannot reply to this comment`, 400));
  }

  // Find the index of the comment to reply to
  const commentIndex = blog.comment.findIndex(
    (comment) => comment._id.toString() === commentId
  );

  if (commentIndex === -1) {
    return next(new ErrorHandler(`Comment Doesn't exist`, 404));
  }

  // Check if the owner has already replied to this comment
  const existingReplyIndex = blog.comment[commentIndex].reply.findIndex(
    (reply) => reply.user.toString() === req.user.id
  );
  if (existingReplyIndex !== -1) {
    // If the owner has already replied, update the existing reply
    blog.comment[commentIndex].reply[existingReplyIndex].title = title;
  } else {
    // Otherwise, create a new reply
    blog.comment[commentIndex].reply.push({ title, user: userId });
  }

  // Save the updated blog post

  await blog.save();
  res.status(201).json({
    success: true,

    message: "reply created successfully",
  });
});

// Delete the reply

export const deleteReply = catchAsyncFunc(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  const { commentId, replyId } = req.body;
  if (!blog) {
    return next(new ErrorHandler(`Post Doesn't exist`, 400));
  }
  if (blog.user.toString() !== req.user.id) {
    return next(new ErrorHandler(`You cannot delete the reply`, 400));
  }
  const commentIndex = blog.comment.findIndex(
    (comment) => comment._id.toString() === commentId
  );
  if (commentIndex === -1) {
    return next(new ErrorHandler(`Comment Doesn't exist`, 404));
  }

  // Check if the owner has already replied to this comment
  const existingReplyIndex = blog.comment[commentIndex].reply.findIndex(
    (reply) => reply._id.toString() === replyId
  );
  if (existingReplyIndex === -1) {
    // If the owner has already replied, update the existing reply
    return next(new ErrorHandler(`reply Doesn't exist`, 404));
  }

  blog.comment[commentIndex].reply.splice(existingReplyIndex, 1);

  // Save the updated blog post
  await blog.save();

  res.status(201).json({
    success: true,

    message: "reply deleted successfully",
  });
});

//Save user Post

export const savePost = catchAsyncFunc(async (req, res, next) => {
  const blogId = req.params.id;
  const userId = req.user.id;

  const blog = await Blog.findById(blogId);

  if (!blog) {
    return next(new ErrorHandler(`Post Doesn't exist`, 400));
  }

  // Check if the user has already saved the post
  const savedByUser = blog.savePost.find(
    (saved) =>
      saved.user.toString() === userId && saved.blogId.toString() === blogId
  );

  if (savedByUser) {
    // User has saved the post, so remove it from their saved list
    const savedIndex = blog.savePost.findIndex(
      (saved) =>
        saved.user.toString() === userId && saved.blogId.toString() === blogId
    );
    blog.savePost.splice(savedIndex, 1);

    // Set savePostClicked to false, as the user is now unsaving the post
    blog.savePostClicked = false;

    await blog.save();

    res.status(201).json({
      success: true,
      message: "Post unsaved successfully",
    });
  } else {
    // User hasn't saved the post, so add it to their saved list
    blog.savePost.push({ user: userId, blogId });

    // Set savePostClicked to true, as the user is saving the post
    blog.savePostClicked = true;

    await blog.save();

    res.status(201).json({
      success: true,
      message: "Post saved successfully",
    });
  }
});

//if the user authenticated he can access his blogs

export const userAllBlogs = catchAsyncFunc(async (req, res, next) => {
  const userId = req.user.id;
  const baseQuery = Blog.find({ user: userId });
  if (!userId) {
    return next(new ErrorHandler(`plz login first`, 400));
  }

  // Initialize ApiFeatures with the base query and the query string from request
  const features = new ApiFeatures(baseQuery, req.query);

  // Apply filtering, sorting, and pagination
  features.search().mostLikes().mostViews().paginate();

  // Execute the query
  const userPosts = await features.query;

  res.status(200).json({
    success: true,
    count: userPosts.length,
    userPosts,
  });
});

//admin routes controller

export const adminAllPost = catchAsyncFunc(async (req, res, next) => {
  const blog = await Blog.find();

  res.status(200).json({
    success: true,
    blog,
  });
});

export const adminAllPostDelete = catchAsyncFunc(async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) {
    return next(new ErrorHandler((message = "blog not found"), 400));
  }
  const blog = await Blog.findByIdAndDelete({ _id: userId });

  res.status(200).json({
    success: true,
    message: "Blog deleted successfully",
  });
});
