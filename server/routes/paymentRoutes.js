
const express = require("express");
const Subscription = require("../model/Subscription");
const User = require("../model/User");
const logger = require("../logger");
const authMiddleware = require("../middleware/authMiddleware");
require("dotenv").config();
const cookieParser = require('cookie-parser')

const {
  STRIPE_PRIVATE_KEY,
  STRIPE_PRICE_PREMIUM_ID,
  FRONTEND_URL,
  BACKEND_URL,
  STRIPE_WEBHOOK_SECRET_KEY,
} = process.env;

const stripe = require("stripe")(STRIPE_PRIVATE_KEY);

const router = express.Router();
router.use(cookieParser())

// Validate environment variables
if (!STRIPE_PRIVATE_KEY || !STRIPE_WEBHOOK_SECRET_KEY) {
  logger.error("Missing required environment variables");
  process.exit(1);
}

router.post("/webhook", express.raw({
  type: (req) => {
    const ct = req.headers["content-type"] || "";
    return ct.startsWith("application/json");
  }
}), async (req, res) => {
  // guard against array headers
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET_KEY);
  } catch (err) {
    logger.error("⚠️ Webhook signature verification failed:", err);
    return res.status(400).send("Webhook signature verification failed");
  }

  const eventType = event.type;
  const eventData = event.data.object;

  switch (eventType) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const { metadata, subscription: stripeSubscriptionId, payment_status } = session;

      if (
        !metadata?.userId ||
        !metadata.subscriptionType ||
        !stripeSubscriptionId ||
        payment_status !== "paid"
      ) {
        logger.error("🚨 Missing metadata or unpaid session:", metadata, stripeSubscriptionId, payment_status);
        return res.status(400).send("Missing required metadata or payment.");
      }

      const { userId, subscriptionType } = metadata;

      try {
        // Deactivate existing subscription
        const existing = await Subscription.findOne({ user_id: userId, status_type: "active" });
        if (existing) {
          existing.status_type = "inactive";
          existing.end_date = new Date();
          await existing.save();
        }

        // Create new subscription record
        const startDate = new Date();
        let endDate = null;
        if (["premium"].includes(subscriptionType)) {
          endDate = new Date(startDate);
          endDate.setFullYear(endDate.getFullYear() + 1);
        }

        const newSub = new Subscription({
          user_id: userId,
          customer_id: session.customer,
          subscription_type: subscriptionType,
          start_date: startDate,
          end_date: endDate,
          status_type: "active",
          stripeSubscriptionId,
          lastPayment: new Date(),
        });

        await newSub.save();
        logger.info(`✅ Subscription record created for user ${userId}: ${subscriptionType}`);
        return res.status(200).send(); // Success
      } catch (err) {
        logger.error("🚨 Failed to save subscription record:", err);
        return res.status(500).send("Internal Server Error");
      }
    }
    case "invoice.paid":
      logger.info("🔔 invoice.paid:", event.data.object.id);

      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: eventData.subscription },
        { status_type: "active", lastPayment: new Date() }
      );
      break;

    case "invoice.payment_failed":
      logger.warn("🔔 invoice.payment_failed:", event.data.object.id);

      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: eventData.subscription },
        { status_type: eventData.attempt_count > 3 ? "canceled" : "past_due" }
      );

      break;

    case "customer.subscription.updated":
      logger.info("🔔 Customer.subscription.updated:", event.data.object.id);

      await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: eventData.id },
        {
          status_type: eventData.status,
          end_date: new Date(eventData.current_period_end) * 1000,
          cancelAtPeriodEnd: eventData.cancel_at_period_end,
          current_period_start: new Date(eventData.current_period_start) * 1000,
          current_period_end: new Date(eventData.current_period_end) * 1000,
        }
      );

      if (!eventData.cancel_at_period_end) {
        logger.info("✅ User reactivated subscription.");
      }

      break;

    case "customer.subscription.created": {
      const { metadata } = eventData;
      if (!metadata?.userId || !metadata?.subscriptionType) {
        logger.error(
          "🚨 Missing metadata on customer.subscription.created",
          metadata
        );
        return res.status(400).send("Missing metadata");
      }

      logger.info("🚀 New subscription created:", eventData.id);

      const newSubscription = new Subscription({
        user_id: eventData.metadata.userId,
        customer_id: eventData.customer,
        subscription_type: eventData.metadata.subscriptionType,
        status_type: "active",
        current_period_start: new Date(eventData.current_period_start* 1000), 
        current_period_end: new Date(eventData.current_period_end* 1000) ,
        stripeSubscriptionId: eventData.id,
        start_date: new Date(),
        end_date: new Date(eventData.current_period_end * 1000),
        cancelAtPeriodEnd: false,
      });

      await newSubscription.save();

      logger.info(`✅ Subscription created successfully.`);
      break;
    }
    case 'customer.subscription.deleted': {
      logger.warn("❌ Subscription canceled:", eventData.id);

      // Find the canceled subscription
      const canceledSubscription = await Subscription.findOneAndUpdate(
        { stripeSubscriptionId: eventData.id },
        { status_type: "canceled", canceledAt: new Date() },
        { new: true }
      );

      if (!canceledSubscription) {
        logger.error("🚨 Subscription not found.");
        return res.status(404).send("Subscription not found.");
      }

      // Check if the user has any active subscriptions left
      const activeSubscriptions = await Subscription.find({
        user_id: canceledSubscription.user_id,
        status_type: "active",
      });

      if (activeSubscriptions.length === 0) {
        logger.info("🔄 No active subscriptions found. Reverting user to Free Plan.");

        // Create a new Free subscription entry if the user has no active plans
        const newFreeSubscription = new Subscription({
          user_id: canceledSubscription.user_id,
          customer_id: `free-${canceledSubscription._id}`, // Placeholder since Stripe isn't used here
          subscription_type: "free",
          status_type: "active",
          start_date: new Date(),
          end_date: null, // Free plan has no expiry
          current_period_start: null,
          current_period_end: null,
          stripeSubscriptionId: null,
          cancelAtPeriodEnd: false,
          lastPayment: null,
        });

        await newFreeSubscription.save();
        logger.info("✅ User reverted to Free Plan.");
      } else {
        logger.info("✅ User still has an active subscription. No action needed.");
      }
      break;
    }
    default:
      logger.warn(`🔔 Unhandled event type: ${event.type}`);
  }

  res.status(200).send();
}
);

// Price ID map based on subscription type
const priceIdMap = {
  premium: STRIPE_PRICE_PREMIUM_ID,
};

/**
 * POST /api/payments/create-checkout-session
 * Body: { userId: string, subscriptionType: string }
 */
router.post("/create-checkout-session", express.json(), async (req, res) => {
  const { userId, subscriptionType } = req.body;

  if (!userId || !subscriptionType) {
    return res.status(400).json({ message: "userId and subscriptionType are required." });
  }

  const priceId = priceIdMap[subscriptionType];
  if (!priceId) {
    return res.status(400).json({ message: "Invalid subscription type." });
  }

  try {
    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Prevent upgrading if already active on the same tier
    const activeSub = await Subscription.findOne({ user_id: userId, status_type: "active" });
    if (activeSub && activeSub.subscription_type === subscriptionType) {
      return res.status(400).json({
        message: `You already have an active ${subscriptionType} subscription.`,
      });
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: user.email,
      success_url: `${BACKEND_URL}/api/payments/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/cancel`,
      metadata: { userId, subscriptionType },
    });

    return res.json({ url: session.url });
  } catch (err) {
    logger.error("Error creating checkout session:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/payment-success", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

    if (session.status === "complete") {
      logger.info("✅ Payment successful:", session.id);
      return res.redirect(`${FRONTEND_URL}/payment-success`);
    } else {
      logger.info("❌ Payment not successful");
      return res.redirect(`${FRONTEND_URL}/payment-failed`);
    }
  } catch (error) {
    logger.error("🚨 Error in /payment-success:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/customers/:customerId", authMiddleware, async (req, res) => {
  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: req.params.customerId,
      return_url: FRONTEND_URL,
    });

    logger.info("Billing portal session created:", portalSession.id);
    res.json({ url: portalSession.url });
  } catch (err) {
    logger.error("Error creating billing portal session:", err);
    return res.status(500).json({ message: "Internal server error." });
  }
});

/**
 * GET /api/payments/subscription-status
 * Returns the current subscription status for the authenticated user.
 */
router.get(
  '/subscription-status',
  authMiddleware,
  async (req, res) => {
    try {
      const sub = await Subscription
        .findOne({ user_id: req.user.id })
        .sort({ current_period_end: -1, updatedAt: -1 })
        .lean();

      if (!sub) {
        return res.json({ status: null });
      }

      return res.json({ status: sub.status_type });
    } catch (err) {
      console.error('Error fetching subscription status:', err);
      return res.status(500).json({
        error: 'Could not fetch subscription status.',
      });
    }
  }
);



module.exports = router;
