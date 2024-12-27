import { imageUploadUtil } from "../../helpers/cloudinary.js";
import Product from "../../models/Product.js";
import errorResposne from "../../utils/errorResponse.js";
import successResposne from "../../utils/successResponse.js";

export const handleImageUpload = async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await imageUploadUtil(url);
    successResposne({
      res,
      data: result,
    });
  } catch (e) {
    console.log("handleImageUpload", e);
    errorResposne({
      res,
      message: "Error occured while image upload!",
    });
  }
};

//add product
export const addProduct = async (req, res) => {
  try {
    const {
      image,
      title,
      description,
      category,
      woodType,
      height,
      weight,
      price,
      salePrice,
      totalStock,
      averageReview,
    } = req.body;

    const createdProduct = new Product({
      image,
      title,
      description,
      category,
      woodType,
      height,
      weight,
      price,
      salePrice,
      totalStock,
      averageReview,
    });
    await createdProduct.save();
    successResposne({
      res,
      statusCode: 201,
      data: createdProduct,
      message: "Product created successfully!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};

//get all products
export const fetchAllProducts = async (req, res) => {
  try {
    const productList = await Product.find({});
    successResposne({
      res,
      statusCode: 200,
      data: productList,
      message: "Products fetched successfully!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};

//Edit Product
export const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      image,
      title,
      description,
      category,
      woodType,
      height,
      weight,
      price,
      salePrice,
      totalStock,
      averageReview,
    } = req.body;
    let findProduct = await Product.findById(id);
    if (!findProduct) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "Product not found!",
      });
    }
    findProduct.title = title || findProduct.title;
    findProduct.description = description || findProduct.description;
    findProduct.category = category || findProduct.category;
    findProduct.woodType = woodType || findProduct.woodType;
    findProduct.height = height || findProduct.height;
    findProduct.weight = weight || findProduct.weight;
    findProduct.price = price === "" ? 0 : price || findProduct.price;
    findProduct.salePrice =
      salePrice === "" ? 0 : salePrice || findProduct.salePrice;
    findProduct.totalStock = totalStock || findProduct.totalStock;
    findProduct.averageReview = averageReview || findProduct.averageReview;
    findProduct.image = image || findProduct.image;
    await findProduct.save();
    successResposne({
      res,
      statusCode: 200,
      data: findProduct,
      message: "Products updated successfully!",
    });
  } catch (e) {
    console.log("e", e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};

//delete product
export const deletProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletProduct) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "Product not found!",
      });
    }
    successResposne({
      res,
      statusCode: 200,
      message: "Product deleted successfully!",
    });
  } catch (e) {
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};
