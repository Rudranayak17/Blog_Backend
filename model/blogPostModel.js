import mongoose from "mongoose";

const blogPostSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  avatar:{
    type:String
  },
  title: {
    type: String,
    required: [true, "Please create a title"],
    minLength: [4, "title atleast have 4 characters"],
    maxLength: [60, "title not be exceed  60 characters"],
  },
  content: {
    type: String,
    required: [true, "Please create a content"],
    minLength: [70, "Content atleast have 4 characters"],

    maxLength: [3000, "Content not be exceed  3000 characters"],
  },
  views: {
    type: Number,
    default: 0,
  },
  blogImg: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  savePostClicked: {
    type: Boolean,
    default: false,
  },
  savePost: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      blogId: {
        type: mongoose.Schema.ObjectId,
        ref: "Blog",
      },
    },
  ],

  likeClicked: {
    type: Boolean,
    default: false,
  },
  likes: {
    type: Number,
    default: 0,
  },
  tags: {
    type: String,
    default: "All",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  comment: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      title: {
        type: String,
      },
      like: {
        type: Number,
        default: 0,
      },
      dislike: {
        type: Number,
        default: 0,
      },
      reply: [
        {
          user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required: true,
          },
          title: {
            type: String,
          },
        },
      ],
    },
  ],
  likedBy: [],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Blog = mongoose.model("Blog", blogPostSchema);

export default Blog;
