import express from "express";
import { upload } from "../../helpers/cloudinary.js";
import {
  addProduct,
  deletProduct,
  editProduct,
  fetchAllProducts,
  handleImageUpload,
} from "../../controllers/admin/productController.js";

const router = express.Router();
router.post("/upload-image", upload.single("my_file"), handleImageUpload);
router.get("/fetch-products", fetchAllProducts);
router.post("/add-product", addProduct);
router.put("/edit-product/:id", editProduct);
router.delete("/delete-product/:id", deletProduct);

export default router;
