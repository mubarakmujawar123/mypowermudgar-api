import Cart from "../../models/Cart.js";
import Product from "../../models/Product.js";

import errorResposne from "../../utils/errorResponse.js";
import successResposne from "../../utils/successResponse.js";
import { calculateItemPrice } from "../../utils/utils.js";

export const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity, productAdditionalInfo, basePrice } =
      req.body;
    if (!userId || !productId || quantity <= 0) {
      return errorResposne({
        res,
        statusCode: 400,
        message: "Invalid data provided!",
      });
    }
    const product = await Product.findById(productId);
    if (!product) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "Product not found!",
      });
    }
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }
    //finding if provide is already in cart based on product ID and product descriptions
    const currentProductIndex = cart.items.findIndex((item) => {
      return (
        item.productId.toString() === productId &&
        JSON.stringify(item.productAdditionalInfo) ===
          JSON.stringify(productAdditionalInfo)
      );
    });
    if (currentProductIndex === -1) {
      cart.items.push({
        productId,
        quantity,
        productAdditionalInfo,
        price: calculateItemPrice(basePrice, quantity, productAdditionalInfo),
      });
    } else {
      cart.items[currentProductIndex].quantity += quantity;
      cart.items[currentProductIndex].price = calculateItemPrice(
        basePrice,
        cart.items[currentProductIndex].quantity,
        productAdditionalInfo
      );
    }
    await cart.save();

    return successResposne({
      res,
      statusCode: 200,
      data: cart,
      message: "Products added to cart!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};

export const fetchCartItems = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("userId", userId);
    if (!userId) {
      return errorResposne({
        res,
        statusCode: 400,
        message: "User Id is mandatory!",
      });
    }
    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "category image title price salePrice",
    });

    if (!cart) {
      return errorResposne({
        res,
        statusCode: 400,
        message: "Cart not found!",
      });
    }
    const validItems = cart.items.filter(
      (productItem) => productItem.productId
    );

    if (validItems.length < cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }
    const populateCartItems = validItems.map((item) => ({
      productId: item.productId._id,
      category: item.productId.category,
      image: item.productId.image,
      title: item.productId.title,
      price: item.productId.price,
      salePrice: item.productId.salePrice,
      quantity: item.quantity,
      productAdditionalInfo: item.productAdditionalInfo,
    }));

    return successResposne({
      res,
      statusCode: 200,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
      message: "Cart data!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};

export const updateCartItemQuantity = async (req, res) => {
  try {
    const { userId, productId, quantity, productAdditionalInfo } = req.body;
    if (!userId || !productId || quantity <= 0) {
      return errorResposne({
        res,
        statusCode: 400,
        message: "Invalid data provided!",
      });
    }
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "Cart not found!",
      });
    }
    const currentProductIndex = cart.items.findIndex((item) => {
      return (
        item.productId.toString() === productId &&
        JSON.stringify(item.productAdditionalInfo) ===
          JSON.stringify(productAdditionalInfo)
      );
    });
    if (currentProductIndex === -1) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "Cart items not present!",
      });
    }
    cart.items[currentProductIndex].quantity = quantity;
    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "category image title price salePrice ",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      category: item.productId ? item.productId.category : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      quantity: item.quantity,
      productAdditionalInfo: item.productAdditionalInfo,
    }));
    return successResposne({
      res,
      statusCode: 200,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
      message: "Cart updated successfully!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};

export const deleteCartItem = async (req, res) => {
  try {
    let { userId, productId, productAdditionalInfo } = req.params;
    productAdditionalInfo = JSON.parse(productAdditionalInfo);
    if (!userId || !productId) {
      return errorResposne({
        res,
        statusCode: 400,
        message: "Invalid data provided!",
      });
    }
    const cart = await Cart.findOne({ userId }).populate({
      path: "items.productId",
      select: "category image title price salePrice",
    });
    if (!cart) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "Cart not found!",
      });
    }
    cart.items = cart.items.filter(
      (item) =>
        item.productId._id.toString() !== productId ||
        JSON.stringify(item.productAdditionalInfo) !==
          JSON.stringify(productAdditionalInfo)
    );

    await cart.save();

    await cart.populate({
      path: "items.productId",
      select: "category image title price salePrice",
    });

    const populateCartItems = cart.items.map((item) => ({
      productId: item.productId ? item.productId._id : null,
      category: item.productId ? item.productId.category : null,
      image: item.productId ? item.productId.image : null,
      title: item.productId ? item.productId.title : "Product not found",
      price: item.productId ? item.productId.price : null,
      salePrice: item.productId ? item.productId.salePrice : null,
      quantity: item.quantity,
      productAdditionalInfo: item.productAdditionalInfo,
    }));
    return successResposne({
      res,
      statusCode: 200,
      data: {
        ...cart._doc,
        items: populateCartItems,
      },
      message: "Cart item deleted successfully!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};
