import cookieParser from "cookie-parser"
import express from "express"
import user from "./routers/userRoute.js"
import blogPost from "./routers/blogRoute.js"
import { errorMiddleware } from "./middleware/error.js"
import bodyParser from "body-parser"
import cors from "cors";
export const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true })); // Use express.urlencoded for parsing URL-encoded data
app.use(cors({
    origin:[process.env.FONTEND_URL],
  
    methods:['GET', 'POST','PUT','DELETE'],
    credentials:true    
}))

// app.use(bodyParser.urlencoded({extended:true}))

app.use("/api/v1",user)
app.use("/api/v1",blogPost)


//middleware for error handling
app.use(errorMiddleware)
app.get("/", (req, res) => {
    res.send(" Server is working ");
  });