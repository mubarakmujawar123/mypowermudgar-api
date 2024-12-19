import Order from "../../models/Order.js";
import User from "../../models/User.js";
import errorResposne from "../../utils/errorResponse.js";
import successResposne from "../../utils/successResponse.js";

export const getOrdersStatusDataForAdmin = async (req, res) => {
  try {
    const ordersStatusData = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $group: {
          _id: null,
          counts: {
            $push: {
              k: "$_id",
              v: "$count",
            },
          },
        },
      },
      {
        $replaceRoot: {
          newRoot: {
            $arrayToObject: "$counts",
          },
        },
      },
    ]);
    if (!ordersStatusData && !ordersStatusData?.length === 0) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "No orders found!",
      });
    }

    return successResposne({
      res,
      statusCode: 200,
      data: ordersStatusData[0],
      message: "orders found!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};

export const getUsersStatusDataForAdmin = async (req, res) => {
  try {
    const usersData = await User.find({});
    if (!usersData && !usersData?.length === 0) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "No users found!",
      });
    }
    const verifiedUserCount = usersData?.filter(
      (user) => user.isVerified
    )?.length;
    const unVerifiedUserCount = usersData?.filter(
      (user) => !user.isVerified
    )?.length;

    return successResposne({
      res,
      statusCode: 200,
      data: { verifiedUserCount, unVerifiedUserCount },
      message: "Users found!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};
