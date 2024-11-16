import express from "express";
import {
  capturePayment,
  createOrder,
  getAllOrderByUser,
  getOrderDetails,
} from "../../controllers/shop/orderController.js";

const router = express.Router();

router.post("/create", createOrder);
router.post("/capture-payment", capturePayment);
router.get("/orders-list/:userId", getAllOrderByUser);
router.get("/order-details/:id", getOrderDetails);

export default router;
