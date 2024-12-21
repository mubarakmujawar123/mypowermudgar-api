import mongoose, { Schema } from "mongoose";

const OrderSchema = new mongoose.Schema({
  userId: String,
  cartId: String,
  cartItems: [
    {
      productId: String,
      title: String,
      image: String,
      price: String,
      quantity: Number,
      category: String,
      productAdditionalInfo: {
        type: Schema.Types.Mixed,
      },
    },
  ],
  addressInfo: {
    addressId: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    phone: String,
    country: String,
    notes: String,
  },
  orderStatus: String,
  orderInCurrency: String,
  orderInCurrencyRate: Number,
  paymentMethod: String,
  paymentStatus: String,
  totalAmount: Number,
  totalCartPriceWithPreferredCurrency: Number,
  shippingCost: Number,
  orderDate: Date,
  orderUpdateDate: Date,
  paymentId: String,
  payerId: String,
  logisticsCompany: String,
  consignmentNumber: String,
});

export default mongoose.model("Order", OrderSchema);
