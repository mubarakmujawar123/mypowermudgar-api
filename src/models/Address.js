import mongoose, { Schema } from "mongoose";

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
    // isDefault: Schema.Types.Boolean,
  },
  { timestamps: true }
);

export default mongoose.model("Address", AddressSchema);
