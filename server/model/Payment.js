const mongoose = require("mongoose");
const { Schema } = mongoose;

const PaymentSchema = new Schema({
  subscription_id: {
    type: Schema.Types.ObjectId,
    ref: "Subscription",
    required: true,
  },
  amount: { type: Number, required: true },
  payment_date: { type: Date, default: Date.now },
  payment_method: {
    type: String,
    enum: ["Credit Card", "PayPal", "Bank Transfer"],
    required: true,
  },
  status: { type: String, enum: ["Completed", "Pending"], default: "Pending" },
});

const Payment = mongoose.model("Payment", PaymentSchema);

module.exports = Payment;
