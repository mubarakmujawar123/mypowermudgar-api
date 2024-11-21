import express from "express";
import {
  getOrderDetailsForAdmin,
  getOrdersOfAllUsers,
  updateOrderStatus,
} from "../../controllers/admin/adminOrderController.js";

const router = express.Router();

router.get("/get", getOrdersOfAllUsers);
router.get("/details/:id", getOrderDetailsForAdmin);
router.put("/update/:id", updateOrderStatus);

export default router;
