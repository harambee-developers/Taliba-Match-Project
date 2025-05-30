
const express = require("express");
const logger = require("../logger");
const authMiddleware = require("../middleware/authMiddleware");
const cookieParser = require('cookie-parser')
const PaymentFacade = require('../services/PaymentFacade')
const Subscription = require("../model/Subscription");
const router = express.Router();

router.use(cookieParser())

router.post("/webhook", express.raw({ type: "*/*" }), async (req, res) => {
  let event;

  try {
    event = PaymentFacade.verifyWebhookSignature(req);
  } catch (err) {
    return res.status(400).send("Webhook Error");
  }

  const { type, data } = event;

  try {
    switch (type) {
      case "checkout.session.completed":
        await PaymentFacade.handleCheckoutSessionCompleted(data.object);
        break;

      case "customer.subscription.updated":
        await PaymentFacade.updateSubscriptionFromStripe(data.object);
        break;

      case "invoice.paid":
        await PaymentFacade.handleInvoicePaid(data.object);
        break;

      case "invoice.payment_failed":
        await PaymentFacade.handleInvoicePaymentFailed(data.object);
        break;

      case "customer.subscription.deleted":
        await PaymentFacade.handleSubscriptionDeleted(data.object);
        break;

      default:
        logger.info(`Unhandled Stripe webhook event: ${type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    logger.error(`Webhook handler error: ${err.message}`);
    res.status(500).send("Webhook handler error");
  }
});

/**
 * POST /api/payments/create-checkout-session
 * Body: { userId: string, subscriptionType: string }
 */
router.post("/create-checkout-session", express.json(), async (req, res) => {
  try {
    const { userId, subscriptionType } = req.body;
    const url = await PaymentFacade.createCheckoutSession(userId, subscriptionType);
    res.json({ url });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/payment-success", async (req, res) => {
  try {
    const sessionId = req.query.session_id

    if (!sessionId) {
      return res.status(400).json({ error: "Missing session ID" });
    }
    const result = await PaymentFacade.handlePaymentSuccess(sessionId)
    res.json({result})
  } catch (error) {
    logger.error("🚨 Error in payment-success:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/customers/:customerId", authMiddleware, async (req, res) => {
  try {
    const url = await PaymentFacade.createBillingPortalSession(req.user.id);
    res.json({ url });
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
      logger.error('Error fetching subscription status:', err);
      return res.status(500).json({
        error: 'Could not fetch subscription status.',
      });
    }
  }
);



module.exports = router;
