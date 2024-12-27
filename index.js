import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import authRouter from "./src/routes/auth/authRoutes.js";
import adminProductsRouter from "./src/routes/admin/adminProductRoutes.js";
import adminOrdersRouter from "./src/routes/admin/adminOrdersRouter.js";
import adminDashbordRouter from "./src/routes/admin/adminDashbordRouter.js";
import shopProductsRouter from "./src/routes/shop/shopRoutes.js";
import shopCartRouter from "./src/routes/shop/cartRoutes.js";
import shopAddressRouter from "./src/routes/shop/addressRouter.js";
import shopOrderRouter from "./src/routes/shop/orderRoutes.js";
import currencyRouter from "./src/routes/currency/currencyRouter.js";
import shippingChargesRouter from "./src/routes/shippingCharges/shippingChargesRouter.js";

if (process.env.NODE_ENV === "dev") {
  dotenv.config({ path: `.env` });
} else {
  dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
}

mongoose
  .connect(process.env.MONGO_DB_URL)
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => console.log("DB connection error", err));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLINET_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Cache-Control",
      "Expries",
      "Pragma",
    ],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/admin/products", adminProductsRouter);
app.use("/api/admin/orders", adminOrdersRouter);
app.use("/api/admin/dashbord", adminDashbordRouter);
app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);
app.use("/api/shop/order", shopOrderRouter);
app.use("/api/currency", currencyRouter);
app.use("/api/shippingCharges", shippingChargesRouter);

app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
