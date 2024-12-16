require("dotenv").config();
const { STRIPE_PRIVATE_KEY, STRIPE_PRICE_ID, FRONTEND_URL } = process.env;
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(STRIPE_PRIVATE_KEY);
const Subscription = require("../model/Subscription");

router.post("/create-checkout-session", async (req, res) => {
  const { userId } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${FRONTEND_URL}`,
      cancel_url: `${FRONTEND_URL}`,
      metadata: {
        userId, // id needs to be linked here for the subscription data later
      },
    });

    console.log("Session created at", session.id, session.url, session);

    res.json({ url: session.url }); // url will need to be sent to the frontend
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post(
  "/webhook",
  express.raw({ type: "application.json" }),
  async (req, res) => {
    const payload = req.body;
    const sig = req.headers["stripe-signature"];

    try {
      const event = stripe.webhooks.constructEvent(
        payload,
        sig,
        STRIPE_PRIVATE_KEY
      );
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        // userid from metadata to update your database
        const userId = session.metadata.userId;
        const subscriptionId = session.subscription;

        await Subscription.findbyIdandupdate(
          userId,
          { subscription_type: "Premium", status_type: "Active" },
          { new: true } // Returns the updated document
        );
        console.log(`Subscription updated for user: ${userId}`);
      }
    } catch (dbError) {
      console.error("Database update failed: ", dbError);
      return res.status(500).send("Database Error");
    }
    res.status(200)("Event reached!");
  }
);

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
