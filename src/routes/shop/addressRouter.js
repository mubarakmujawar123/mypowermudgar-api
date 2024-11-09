import { Router } from "express";
import {
  addAddress,
  deleteAddress,
  fetchAddress,
  updateAddress,
} from "../../controllers/shop/addressController.js";

const router = Router();

router.get("/fetch-address/:userId", fetchAddress);
router.post("/add-address", addAddress);
router.put("/update-address/:userId/:addressId", updateAddress);
router.delete("/delete-address/:userId/:addressId", deleteAddress);

export default router;
