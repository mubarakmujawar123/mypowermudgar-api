import express from "express";
import {
  getCurrencyRates,
  setCurrencyRates,
} from "../../controllers/auth/currencyRatesController.js";

const router = express.Router();
router.post("/setCurrencyRates", setCurrencyRates);
router.get("/getCurrencyRates", getCurrencyRates);

export default router;
