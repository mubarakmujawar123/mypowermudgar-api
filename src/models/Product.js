import mongoose from "mongoose";

const productSchema = mongoose.Schema(
  {
    image: String,
    title: String,
    description: String,
    category: String,
    woodType: [String],
    height: [String],
    weight: [String],
    price: Number,
    salePrice: Number,
    totalStock: Number,
    averageReview: Number,
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
