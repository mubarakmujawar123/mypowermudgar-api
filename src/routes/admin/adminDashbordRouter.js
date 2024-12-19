import express from "express";
import {
  getOrdersStatusDataForAdmin,
  getUsersStatusDataForAdmin,
} from "../../controllers/admin/dashboardController.js";

const router = express.Router();
router.get("/ordersStatusDataForAdmin", getOrdersStatusDataForAdmin);
router.get("/usersStatusDataForAdmin", getUsersStatusDataForAdmin);

export default router;
