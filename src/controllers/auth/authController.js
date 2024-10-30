import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import successResposne from "../../utils/successResponse.js";
import errorResposne from "../../utils/errorResponse.js";

export const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;
  console.log("userName", userName, email, password);
  try {
    const findUser = await User.findOne({ email });
    console.log("finduser", findUser);
    if (findUser) {
      return errorResposne({
        res,
        statusCode: 200,
        message:
          "User already present for this email id. Please try with another email Id.",
      });
    }
    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = new User({ userName, email, password: hashPassword });
    await newUser.save();
    successResposne({
      res,
      statusCode: 200,
      message: "Registration successful",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Some error occured!" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const loggedInUser = await User.findOne({ email });
    if (!loggedInUser) {
      return errorResposne({
        res,
        statusCode: 200,
        message:
          "User dosen't exists for this email id. Please register yourself.",
      });
    }
    const isPasswordMatch = await bcrypt.compare(
      password,
      loggedInUser.password
    );
    if (!isPasswordMatch) {
      return errorResposne({
        res,
        statusCode: 200,
        message: "Password Invalid. Please try with correct passowrd.",
      });
    }
    const token = jwt.sign(
      {
        id: loggedInUser._id,
        role: loggedInUser.role,
        email: loggedInUser.email,
        userName: loggedInUser.userName,
      },
      "CLIENT_SECRET_KEY",
      { expiresIn: "60m" }
    );
    res.cookie("token", token, { httpOnly: true, secure: false });
    successResposne({
      res,
      success: true,
      message: "Logged In successfully",
      user: {
        email: loggedInUser.email,
        role: loggedInUser.role,
        id: loggedInUser._id,
        userName: loggedInUser.userName,
      },
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Some error occured!" });
  }
};

export const logoutUser = async (req, res) => {
  res.clearCookie("token");
  successResposne({
    res,
    message: "Logged out successfully",
  });
};

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return errorResposne({
      res,
      statusCode: 401,
      success: false,
      message: "Unauthorized user!",
    });
  }
  try {
    const decodedToken = jwt.verify(token, "CLIENT_SECRET_KEY");
    req.user = decodedToken;
    next();
  } catch (e) {
    console.log(e);
    return errorResposne({
      res,
      statusCode: 401,
      success: false,
      message: "Unauthorized user!",
    });
  }
};
