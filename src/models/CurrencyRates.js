import mongoose from "mongoose";

const CurrencyRatesSchema = mongoose.Schema(
  {
    amount: {
      type: Number,
      default: 1,
      required: true,
    },
    base: {
      type: String,
      default: "INR",
      required: true,
    },
    rates: {
      type: Object,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("CurrencyRates", CurrencyRatesSchema);
