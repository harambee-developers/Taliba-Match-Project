require("dotenv").config();
const { STRIPE_PRIVATE_KEY, STRIPE_PRICE_ID, FRONTEND_URL } = process.env;
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(STRIPE_PRIVATE_KEY);

router.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 2,
        },
      ],
      mode: "subscription",
      success_url: `${FRONTEND_URL}`,
      cancel_url: `${FRONTEND_URL}`,
    });

    console.log("Session created at", session.id, session.url, session);

    res.json({ url: session.url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/payment-success", async (req, res) => {
  try {
    const { sessionId } = req.body;

    // Retrieve the session. If you need more details, you can expand the line_items or customer
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === "paid") {
      res.status(200).json({ message: "Customer has paid" });
    } else {
      res.status(400).json({ message: "Payment not successful" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
