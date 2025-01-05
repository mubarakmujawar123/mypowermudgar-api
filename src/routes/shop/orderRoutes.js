import express from "express";
import {
  canclePayment,
  capturePayment,
  createOrder,
  getAllOrderByUser,
  getInvoice,
  getOrderDetails,
} from "../../controllers/shop/orderController.js";

const router = express.Router();

router.post("/create", createOrder);
router.post("/capture-payment", capturePayment);
router.post("/cancle-payment", canclePayment);
router.get("/orders-list/:userId", getAllOrderByUser);
router.get("/order-details/:id", getOrderDetails);
router.get("/getInvoice/:id", getInvoice);

export default router;
