import * as express from "express";
import {
  authMiddleware,
  editPreference,
  loginUser,
  logoutUser,
  registerUser,
  resendOTP,
  resetPasswordOTPGenerate,
  updatePassword,
  verifyAccount,
  verifyResetPasswordOTP,
} from "../../controllers/auth/authController.js";
import successResposne from "../../utils/successResponse.js";

const router = express.Router();

router.post("/register", registerUser);
router.put("/editPreference/:id", editPreference);
router.put("/verifyAccount/:id", verifyAccount);
router.put("/verifyResetPasswordOTP", verifyResetPasswordOTP);
router.put("/updatePassword", updatePassword);
router.get("/resendOTP/:id", resendOTP);
router.post("/resetPasswordOTP", resetPasswordOTPGenerate);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/checkAuth", authMiddleware, (req, res) => {
  const user = req.user;
  successResposne({
    res,
    statusCode: 200,
    message: "Authenticate the user!",
    user,
  });
});

export default router;
