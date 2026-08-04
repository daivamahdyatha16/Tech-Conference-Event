import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../configs/cloudinary";
import { AppError } from "../errors/AppError";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "tech-conference-marketplace",
    public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
    resource_type: "image",
  }),
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new AppError("Only image files are allowed", 400));
      return;
    }

    cb(null, true);
  },
});