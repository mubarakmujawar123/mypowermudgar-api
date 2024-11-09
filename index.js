import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./src/routes/auth/authRoutes.js";
import adminProductsRouter from "./src/routes/admin/adminRoutes.js";
import shopProductsRouter from "./src/routes/shop/shopRoutes.js";
import shopCartRouter from "./src/routes/shop/cartRoutes.js";
import shopAddressRouter from "./src/routes/shop/addressRouter.js";

mongoose
  .connect(
    "mongodb+srv://mmsoftinc:MQ1M9ezzZMpfYKzs@mypowermudgarcluster.xouai.mongodb.net/"
  )
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => console.log("DB connection error", err));

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173",
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
app.use("/api/shop/products", shopProductsRouter);
app.use("/api/shop/cart", shopCartRouter);
app.use("/api/shop/address", shopAddressRouter);

app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
