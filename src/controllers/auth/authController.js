import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/User.js";
import successResposne from "../../utils/successResponse.js";
import errorResposne from "../../utils/errorResponse.js";
import { sendMail } from "../../helpers/emailConfiguration.js";
const minNumber = 100000;
const maxNumber = 999999;

const generateOTP = () => {
  // return Math.floor(1000 + Math.random() * 900000).toString(); // 6 digit otp

  return Math.floor(Math.random() * (maxNumber - minNumber)) + minNumber; // 6 digit otp
};

export const registerUser = async (req, res) => {
  let { userName, email, password } = req.body;

  try {
    if (!userName || !email || !password) {
      return errorResposne({
        res,
        statusCode: 400,
        message: "User Name, Password and Email required!",
      });
    }
    email = email.toLowerCase();
    const findUser = await User.findOne({ email });
    if (findUser) {
      return errorResposne({
        res,
        statusCode: 400,
        message:
          "User already present for this email id. Please try with another email Id.",
      });
    }
    const hashPassword = await bcrypt.hash(password, 12);
    const emailVerificationOTP = generateOTP();
    const emailVerificationOTPExpires = Date.now() + 30 * 60 * 1000; // 30 min otp expires time form current time

    const newUser = new User({
      userName,
      email,
      password: hashPassword,
      emailVerificationOTP,
      emailVerificationOTPExpires,
    });
    await newUser.save();
    const subject = `Email verification | OTP`;
    const message = `Welcome to MyPowerMudgar e-Store. <br/> Your Email verification OTP is <h2>${emailVerificationOTP}</h2> OTP valid for 30 min. `;

    const emailResp = await sendMail({
      userName: userName,
      to: email,
      subject,
      message,
    });
    if (!emailResp?.accepted) {
      await User.findByIdAndDelete(newUser.id);
      return errorResposne({
        res,
        statusCode: 400,
        userIdForEmailVerification: null,
        message: "There is some error while sending email for OTP.",
      });
    }
    successResposne({
      res,
      statusCode: 200,
      user: {
        id: newUser._id,
      },
      userIdForEmailVerification: newUser._id,
      message: "Verification OTP sent on email.",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};

export const verifyAccount = async (req, res) => {
  const { id } = req.params;
  const { otp } = req.body;
  try {
    if (!id) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "User not found!",
      });
    }
    const user = await User.findById(id);
    if (!user) {
      return errorResposne({
        res,
        statusCode: 404,
        userIdForEmailVerification: id,
        message: "User not found!",
      });
    }
    if (otp !== user.emailVerificationOTP) {
      return errorResposne({
        res,
        statusCode: 404,
        userIdForEmailVerification: id,
        message: "Invalid OTP!",
      });
    }
    if (Date.now() > user.emailVerificationOTPExpires) {
      return errorResposne({
        res,
        statusCode: 400,
        userIdForEmailVerification: id,
        message: "OTP has expired. Please request for new OTP!",
      });
    }
    user.isVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationOTPExpires = undefined;
    await user.save();
    successResposne({
      res,
      statusCode: 201,
      message:
        "Email verified! Please login with your register email and password.",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};
export const verifyResetPasswordOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    if (!email) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "User not found!",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "User not found!",
      });
    }
    if (otp !== user.resetPasswordOTP) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "Invalid OTP!",
      });
    }
    if (Date.now() > user.resetPasswordOTPExpires) {
      return errorResposne({
        res,
        statusCode: 400,
        message: "OTP has expired. Please request for new OTP!",
      });
    }
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpires = undefined;
    await user.save();
    successResposne({
      res,
      statusCode: 201,
      message: "Reset password OTP verified. Please enter new password",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};

export const updatePassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "User not found.",
      });
    }
    const hashPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashPassword;
    await user.save();
    const subject = `Password Reset`;
    const message = `Your password has been reset. <br/> Please login with new password. `;

    const emailResp = await sendMail({
      userName: user.userName,
      to: email,
      subject,
      message,
    });
    if (!emailResp?.accepted) {
      await User.findByIdAndDelete(newUser.id);
      return errorResposne({
        res,
        statusCode: 400,
        userIdForEmailVerification: null,
        message: "There is some error while sending email for OTP.",
      });
    }
    successResposne({
      res,
      statusCode: 201,
      message: "Password has been reset",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};

export const resendOTP = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "User not found!",
      });
    }
    const user = await User.findById(id);
    if (!user) {
      return errorResposne({
        res,
        statusCode: 404,
        userIdForEmailVerification: id,
        message: "User not found!",
      });
    }
    const emailVerificationOTP = generateOTP();
    const emailVerificationOTPExpires = Date.now() + 30 * 60 * 1000; // 30 min otp expires time form current time
    const subject = `Resend | OTP`;
    const message = `New OTP for your Email verification is <h2>${emailVerificationOTP}</h2> OTP valid for 30 min. `;

    const emailResp = await sendMail({
      userName: user.userName,
      to: user.email,
      subject,
      message,
    });
    if (!emailResp?.accepted) {
      // await User.findByIdAndDelete(newUser.id);
      return errorResposne({
        res,
        statusCode: 400,
        userIdForEmailVerification: id,
        message: "There is some error while sending email for OTP.",
      });
    }
    user.emailVerificationOTP = emailVerificationOTP;
    user.emailVerificationOTPExpires = emailVerificationOTPExpires;
    user.save();
    return successResposne({
      res,
      statusCode: 200,
      userIdForEmailVerification: id,
      message: "OTP resent on register email!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};

export const resetPasswordOTPGenerate = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "User not found!",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "User not found!",
      });
    }
    const _resetPasswordOTP = generateOTP();
    const _resetPasswordOTPExpires = Date.now() + 5 * 60 * 1000; // 5 min otp expires time form current time
    const subject = `Reset Password | OTP`;
    const message = `OTP to reset your password is <h2>${_resetPasswordOTP}</h2> OTP valid for 5 min. `;

    const emailResp = await sendMail({
      userName: user.userName,
      to: user.email,
      subject,
      message,
    });
    if (!emailResp?.accepted) {
      // await User.findByIdAndDelete(newUser.id);
      return errorResposne({
        res,
        statusCode: 400,
        message: "There is some error while sending email for OTP.",
      });
    }
    user.resetPasswordOTP = _resetPasswordOTP;
    user.resetPasswordOTPExpires = _resetPasswordOTPExpires;
    user.save();
    return successResposne({
      res,
      statusCode: 200,
      message: "OTP sent on register email!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};

export const editPreference = async (req, res) => {
  const { id } = req.params;
  const { preferredCurrency } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "User not found!.",
      });
    }
    await User.findByIdAndUpdate(id, { preferredCurrency });
    successResposne({
      res,
      statusCode: 201,
      message: "Preference updated successfully!",
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const loggedInUser = await User.findOne({ email });
    if (!loggedInUser) {
      return errorResposne({
        res,
        statusCode: 404,
        message:
          "User dosen't exists for this email id. Please register yourself.",
      });
    }
    if (!loggedInUser.isVerified) {
      const emailVerificationOTP = generateOTP();
      const emailVerificationOTPExpires = Date.now() + 30 * 60 * 1000; // 30 min otp expires time form current time
      const subject = `Email verification | OTP`;
      const message = `Welcome to MyPowerMudgar e-Store. <br/> Your Email verification OTP is <h2>${emailVerificationOTP}</h2> OTP valid for 30 min. `;

      const emailResp = await sendMail({
        userName: loggedInUser.userName,
        to: email,
        subject,
        message,
      });
      if (!emailResp?.accepted) {
        // await User.findByIdAndDelete(newUser.id);
        return errorResposne({
          res,
          statusCode: 400,
          userIdForEmailVerification: loggedInUser._id,
          message: "There is some error while sending email for OTP.",
        });
      }
      loggedInUser.emailVerificationOTP = emailVerificationOTP;
      loggedInUser.emailVerificationOTPExpires = emailVerificationOTPExpires;
      loggedInUser.save();
      return errorResposne({
        res,
        statusCode: 401,
        userIdForEmailVerification: loggedInUser._id,
        message:
          "Email not verified. Please verify email id. Verification OTP sent on email.",
      });
    }
    const isPasswordMatch = await bcrypt.compare(
      password,
      loggedInUser.password
    );
    if (!isPasswordMatch) {
      return errorResposne({
        res,
        statusCode: 404,
        message: "Password Invalid. Please try with correct passowrd.",
      });
    }
    const token = jwt.sign(
      {
        id: loggedInUser._id,
        role: loggedInUser.role,
        email: loggedInUser.email,
        userName: loggedInUser.userName,
        preferredCurrency: loggedInUser.preferredCurrency,
      },
      "CLIENT_SECRET_KEY",
      { expiresIn: "24h" }
    );
    res.cookie("token", token, { httpOnly: true, secure: false });
    /* sendMail({
      userName: loggedInUser.userName,
      to: loggedInUser.email,
      subject: "Logged In",
      message:
        "You have been logged in to MyPowerMudgar e-store. <br/> Happy Shopping</>",
    }); */
    successResposne({
      res,
      success: true,
      message: "Logged In successfully",
      user: {
        email: loggedInUser.email,
        role: loggedInUser.role,
        id: loggedInUser._id,
        userName: loggedInUser.userName,
        preferredCurrency: loggedInUser.preferredCurrency,
      },
    });
  } catch (e) {
    console.log(e);
    errorResposne({ res, statusCode: 500, message: "Something went wrong!" });
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
    const email = decodedToken.email;
    const loggedInUser = await User.findOne({ email });
    req.user = {
      ...decodedToken,
      preferredCurrency: loggedInUser.preferredCurrency,
    };
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
