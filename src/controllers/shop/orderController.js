import { sendMail } from "../../helpers/emailConfiguration.js";
import {
  capturePaymentPaypal,
  createOrderPayPal,
} from "../../helpers/paypal.js";
import Cart from "../../models/Cart.js";
import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import User from "../../models/User.js";
import { currencySymbol } from "../../utils/constant.js";
import errorResposne from "../../utils/errorResponse.js";
import successResposne from "../../utils/successResponse.js";
import { calculateItemPrice, convertPrice } from "../../utils/utils.js";

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
      totalCartPriceWithPreferredCurrency,
      orderDate,
      orderUpdateDate,
      infoForPayPal,
      orderInCurrency,
      orderInCurrencyRate,
      paymentId,
      shippingCost,
      payerId,
      cartId,
    } = req.body;
    const consignmentNumber = "";
    const logisticsCompany = "";

    const cartItemsDetails = cartItems.map((item) => ({
      name: item.title,
      sku: item.productId,
      // description: `Category -${
      //   item.category
      // }, product description - ${JSON.stringify(item.productAdditionalInfo)} \n`,
      unit_amount: {
        currency_code: infoForPayPal?.currencyForCheckout,
        value: `${Number(
          convertPrice(
            calculateItemPrice(item.price, 1, item.productAdditionalInfo),
            infoForPayPal.currencyRateForCheckout
          )
        ).toFixed(2)}`,
      },
      quantity: `${item.quantity}`,
    }));

    const totalAmountUsingCartItems = cartItemsDetails
      .reduce((acc, item) => item.unit_amount.value * item.quantity + acc, 0)
      .toFixed(2);

    const totalAmountDetails = {
      currency_code: infoForPayPal?.currencyForCheckout,
      value: `${Number(
        Number(totalAmountUsingCartItems) +
          Number(
            convertPrice(shippingCost, infoForPayPal.currencyRateForCheckout)
          )
      ).toFixed(2)}`,

      breakdown: {
        item_total: {
          currency_code: infoForPayPal?.currencyForCheckout,
          value: `${totalAmountUsingCartItems}`,
        },
        shipping: {
          currency_code: infoForPayPal?.currencyForCheckout,
          value: `${convertPrice(
            shippingCost,
            infoForPayPal.currencyRateForCheckout
          )}`,
        },
      },
    };
    const response = await createOrderPayPal(
      cartItemsDetails,
      totalAmountDetails
    );

    console.log("response order controller", response);

    if (response.status === "error") {
      return errorResposne({
        res,
        statusCode: 500,
        message: "Error while creating paypal payment",
      });
    }

    const approvalURL = response.data.links.find(
      (link) => link.rel === "approve"
    ).href;

    const newlyCreatedOrder = new Order({
      userId,
      cartId,
      cartItems,
      addressInfo,
      orderStatus,
      paymentMethod,
      paymentStatus: response?.data?.status,
      totalAmount,
      totalCartPriceWithPreferredCurrency,
      shippingCost,
      orderInCurrency: orderInCurrency,
      orderInCurrencyRate: orderInCurrencyRate,
      orderDate,
      orderUpdateDate,
      paymentId: response?.data?.id,
      payerId,
      consignmentNumber,
      logisticsCompany,
    });

    await newlyCreatedOrder.save();

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

const getProductAdditionalInfo = (obj) => {
  let desc = "";
  if (obj) {
    for (const key in obj) {
      if (key === "height") {
        desc += `<br/>Height : ${obj[key]} (Feet)`;
      }
      if (key === "weight") {
        desc += `<br/>Weight : ${obj[key]} (KG)`;
      }
      if (key === "woodType") {
        desc += `<br/>Wood Type : ${obj[key]}`;
      }
    }
  }
  return desc;
};
const getAddress = (obj) => {
  let _address;
  if (obj) {
    _address = `
        Phone: ${obj.phone}<br/>
        Address: ${obj.address}<br/>
        City: ${obj.city}<br/>
        Notes: ${obj.notes}<br/>
        State: ${obj.state}<br/>
        Country: ${obj.country}<br/>
        Pincode: ${obj.pincode}<br/>
      `;
  }
  return _address;
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

    const loggedInUser = await User.findById(order.userId);
    if (!loggedInUser) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "User not found!",
      });
    }
    const getCartId = order.cartId;
    await Cart.findByIdAndDelete(getCartId);

    await order.save();

    const cartItemsInfo = order?.cartItems?.map((item) => {
      const cartItem = ` 
                <br/>Title: ${item.title}, 
                <br/>Category : ${item.category}
                <br/>Quantity : ${item.quantity}
                <br/>Product Price : ${
                  currencySymbol[order.orderInCurrency]
                }&nbsp;${convertPrice(item.price, order.orderInCurrencyRate)} 
                <br/>Product Additional Description : ${getProductAdditionalInfo(
                  item.productAdditionalInfo
                )}
                <br/>`;
      return cartItem;
    });
    sendMail({
      userName: loggedInUser.userName,
      to: loggedInUser.email,
      subject: `Order Details - ${orderId}`,
      message: `Thank you for shopping. We have received your order. 
          <br/> We will ship your order shortly. You will receive notification mail.
          <br/><br/> <b>Order Id : ${orderId}</b> 
          <br/><br/> <b>Order Details</b>
            ${cartItemsInfo.join(" ")}
            <br/> <b>Order Price : </b>
            ${currencySymbol[order.orderInCurrency]}&nbsp;${
        order.totalCartPriceWithPreferredCurrency
      }
            <br/> <b>Shipping Charges : </b>
            ${currencySymbol[order.orderInCurrency]}&nbsp;${convertPrice(
        order.shippingCost,
        order.orderInCurrencyRate
      )}
            <br/> <b>Total Order Amount : </b>
            ${currencySymbol[order.orderInCurrency]}&nbsp;${Number(
        Number(order.totalCartPriceWithPreferredCurrency) +
          Number(convertPrice(order.shippingCost, order.orderInCurrencyRate))
      ).toFixed(2)}
             <br/><br/> <b>Address</b><br/>
            ${getAddress(order.addressInfo)}

            <br/><br/>Note:<br/><i>Order price is based on product price, weight, quantity etc...</i><br/>
            <br/><i>Total order amount is based on total products amount and shipping charges</i><br/>
          `,
    });

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

export const canclePayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    let order = await Order.findById(orderId);
    if (!order) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "Order can not be found to cancle!",
      });
    }

    order.paymentStatus = "CANCELLED";
    order.orderStatus = "CANCELLED";
    order.paymentId = "";
    order.payerId = "";
    await order.save();
    return successResposne({
      res,
      statusCode: 200,
      data: {},
      message: "Order Cancelled!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};

export const getAllOrderByUser = async (req, res) => {
  try {
    const { userId } = req.params;

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
