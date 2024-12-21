import mongoose from "mongoose";

const shippingChargesSchema = mongoose.Schema(
  {
    charges: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("ShippingCharges", shippingChargesSchema);
