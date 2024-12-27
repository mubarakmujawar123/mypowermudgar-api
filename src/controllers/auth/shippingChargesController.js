import successResposne from "../../utils/successResponse.js";
import errorResposne from "../../utils/errorResponse.js";
import ShippingCharges from "../../models/ShippingCharges.js";

export const setShippingCharges = async (req, res) => {
  try {
    const { charges } = req.body;
    console.log("charges", charges);

    if (!charges || (charges && charges?.length == 0)) {
      return errorResposne({
        res,
        statusCode: 400,
        message: "Shipping Charges are required!",
      });
    }

    await ShippingCharges.findOneAndUpdate(
      {},
      { charges: charges },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    successResposne({
      res,
      statusCode: 200,
      message: "Shipping Charges has been updated!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};

export const getShippingCharges = async (req, res) => {
  try {
    const _shippingCharges = await ShippingCharges.find({});
    if (!_shippingCharges) {
      return errorResposne({
        res,
        statusCode: 400,
        message: "Facing issue to get Shipping Charges!",
      });
    }
    successResposne({
      res,
      statusCode: 200,
      data: _shippingCharges[0]?.charges,
      message: "Shipping Charges fechted successfully!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};
