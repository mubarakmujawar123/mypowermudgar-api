import Order from "../../models/Order.js";
import errorResposne from "../../utils/errorResponse.js";
import successResposne from "../../utils/successResponse.js";

export const getOrdersOfAllUsers = async (req, res) => {
  try {
    const orders = await Order.find({})?.sort({ orderDate: -1 });
    if (!orders?.length) {
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
      message: "orders found!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};

export const getOrderDetailsForAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "No order found!",
      });
    }

    return successResposne({
      res,
      statusCode: 200,
      data: order,
      message: "order found!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;
    const order = await Order.findById(id);
    if (!order) {
      return errorResposne({
        res,
        statusCode: 400,
        message: "No order found!",
      });
    }
    await Order.findByIdAndUpdate(id, { orderStatus });

    return successResposne({
      res,
      statusCode: 201,
      data: order,
      message: "Order status is updated successfully!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};
