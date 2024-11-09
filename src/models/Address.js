import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
  {
    userId: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    phone: String,
    country: String,
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model("Address", AddressSchema);
