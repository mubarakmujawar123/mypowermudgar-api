import {
  capturePaymentPaypal,
  createOrderPayPal,
} from "../../helpers/paypal.js";
import Cart from "../../models/Cart.js";
import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import errorResposne from "../../utils/errorResponse.js";
import successResposne from "../../utils/successResponse.js";
import { calculateItemPrice } from "../../utils/utils.js";

export const createOrder = async (req, res) => {
  try {
    const {
      userId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus,
      totalAmount,
      orderDate,
      orderUpdateDate,
      paymentId,
      shippingCost,
      payerId,
      cartId,
    } = req.body;

    console.log("cartItems", cartItems);

    const cartItemsDetails = cartItems.map((item) => ({
      name: item.title,
      sku: item.productId,
      description: `Category -${
        item.category
      }, product description - ${JSON.stringify(item.productDescription)} \n`,
      unit_amount: {
        currency_code: "USD",
        value: `${calculateItemPrice(item.price, 1, item.productDescription)}`,
      },
      quantity: `${item.quantity}`,
    }));
    const totalAmountDetails = {
      currency_code: "USD",
      value: `${(parseInt(totalAmount) + parseInt(shippingCost)).toFixed(2)}`,
      breakdown: {
        item_total: {
          currency_code: "USD",
          value: `${totalAmount.toFixed(2)}`,
        },
        shipping: {
          currency_code: "USD",
          value: `${shippingCost.toFixed(2)}`,
        },
      },
    };
    const response = await createOrderPayPal(
      cartItemsDetails,
      totalAmountDetails
    );

    if (response.status === "error") {
      return errorResposne({
        res,
        statusCode: 500,
        message: "Error while creating paypal payment",
      });
    }
    const newlyCreatedOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus: response?.data?.status,
      totalAmount,
      shippingCost,
      orderDate,
      orderUpdateDate,
      paymentId: response?.data?.id,
      payerId,
    });

    await newlyCreatedOrder.save();
    const approvalURL = response.data.links.find(
      (link) => link.rel === "approve"
    ).href;
    return successResposne({
      res,
      statusCode: 200,
      data: { orderId: newlyCreatedOrder._id },
      approvalURL: approvalURL,
      message: "Order placed successfully!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};

export const capturePayment = async (req, res) => {
  try {
    const { paymentId, payerId, orderId } = req.body;

    let order = await Order.findById(orderId);
    if (!order) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "Order can not be found!",
      });
    }
    const response = await capturePaymentPaypal(paymentId);
    if (response.status === "error") {
      return errorResposne({
        res,
        statusCode: 500,
        message:
          "Error while confirming your order! Our team will get back to you.",
      });
    }
    order.paymentStatus = response?.data?.status;
    order.orderStatus = "CONFIRMED";
    order.paymentId = paymentId;
    order.payerId = payerId;

    /*for (let item of order.cartItems) {
      let product = await Product.findById(item.productId);
      if (!product) {
        return errorResposne({
          res,
          statusCode: 404,
          message: `Not enough stock for this product ${product.title}`,
        });
      }
      product.totalStock -= item.quantity;

      await product.save();
    }*/

    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);

    await order.save();

    return successResposne({
      res,
      statusCode: 200,
      data: {},
      message: "Order Confirmed!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};

export const getAllOrderByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("getAllOrderByUser userID", userId);

    let orders = await Order.find({ userId })?.sort({ orderDate: -1 });
    if (!orders) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "No orders found!",
      });
    }

    return successResposne({
      res,
      statusCode: 200,
      data: orders,
      message: "Orders found!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("getOrderDetails id", id);
    let order = await Order.findById(id);
    if (!order) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "Order not found!",
      });
    }

    return successResposne({
      res,
      statusCode: 200,
      data: order,
      message: "Order found!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};
