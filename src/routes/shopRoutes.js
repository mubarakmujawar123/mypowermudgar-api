import express from "express";
import { fetchFilteredProducts } from "../controllers/shop/shopProductCotroller.js";
fetchFilteredProducts;

const router = express.Router();

router.get("/fetch-products", fetchFilteredProducts);

export default router;
