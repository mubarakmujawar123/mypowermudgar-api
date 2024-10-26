import { v2 as cloudinary } from "cloudinary";

import multer from "multer";

cloudinary.config({
  cloud_name: "dmgolocp8",
  api_key: "892851615531564",
  api_secret: "62gAnPc-6uS5ce1fooA3JJkyJPM",
});

const storage = new multer.memoryStorage();

export const imageUploadUtil = async (file) => {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });
  return result;
};

export const upload = multer({ storage });
