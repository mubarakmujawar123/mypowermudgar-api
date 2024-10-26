import * as express from "express";
import {
  authMiddleware,
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/auth/authController.js";
import successResposne from "../utils/successResponse.js";

const router = express.Router();

router.post("/register", registerUser);
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
