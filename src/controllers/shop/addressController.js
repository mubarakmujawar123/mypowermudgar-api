import Address from "../../models/Address.js";
import errorResposne from "../../utils/errorResponse.js";
import successResposne from "../../utils/successResponse.js";

export const addAddress = async (req, res) => {
  try {
    const {
      userId,
      address,
      city,
      state,
      pincode,
      phone,
      country,
      notes,
      // isDefault,
    } = req.body;
    console.log(req.body);
    if (
      !userId ||
      !address ||
      !city ||
      !state ||
      !pincode ||
      !phone ||
      !country
    ) {
      return errorResposne({
        res,
        statusCode: 400,
        message: "Invalid data provided!",
      });
    }
    const newAddress = new Address({
      userId,
      address,
      city,
      state,
      pincode,
      phone,
      country,
      notes,
      // isDefault,
    });
    await newAddress.save();
    return successResposne({
      res,
      statusCode: 201,
      data: newAddress,
      message: "Address added successfully!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};

export const fetchAddress = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return errorResposne({
        res,
        statusCode: 400,
        message: "Invalid data provided!",
      });
    }
    const addressList = await Address.find({ userId });
    if (!addressList) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "Address not found!",
      });
    }

    return successResposne({
      res,
      statusCode: 200,
      data: addressList,
      message: "Address list",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const formData = req.body;
    console.log("userId", userId, addressId, formData);
    if (!userId || !addressId) {
      return errorResposne({
        res,
        statusCode: 400,
        message: "Invalid data provided!",
      });
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      { _id: addressId, userId },
      formData,
      { new: true }
    );
    if (!updatedAddress) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "Address not found!",
      });
    }
    return successResposne({
      res,
      statusCode: 203,
      data: updatedAddress,
      message: "Address updated successfully!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    if (!userId || !addressId) {
      return errorResposne({
        res,
        statusCode: 400,
        message: "Invalid data provided!",
      });
    }
    const deletedAddress = await Address.findByIdAndDelete({
      _id: addressId,
      userId,
    });
    if (!deletedAddress) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "Address not found!",
      });
    }
    return successResposne({
      res,
      statusCode: 200,
      message: "Address deleted successfully!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};
