import multer from "multer";
import path from "path";

// Set up the Multer storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './images'); // Store uploaded images in the 'public/images' directory
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}${path.extname(file.originalname)}`); // Rename the uploaded file
    },
  });
  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PNG or JPG files are allowed."), false);
    }
  };
  
  const upload = multer({ storage: storage ,fileFilter: fileFilter});


export default upload