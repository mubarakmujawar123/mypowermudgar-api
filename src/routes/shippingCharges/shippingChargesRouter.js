import express from "express";
import {
  getShippingCharges,
  setShippingCharges,
} from "../../controllers/auth/shippingChargesController.js";

const router = express.Router();
router.post("/setShippingCharges", setShippingCharges);
router.get("/getShippingCharges", getShippingCharges);

export default router;
