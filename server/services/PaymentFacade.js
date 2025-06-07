const Subscription = require("../model/Subscription");
const User = require("../model/User");
const Payment = require("../model/Payment");
const logger = require("../stripeLogger");

const {
  STRIPE_PRICE_PLATINUM_ID,
  STRIPE_PRICE_GOLD_ID,
  STRIPE_PRIVATE_KEY,
  BACKEND_URL,
  FRONTEND_URL,
  STRIPE_WEBHOOK_SECRET_KEY,
} = process.env;

const priceIdMap = {
  platinum: STRIPE_PRICE_PLATINUM_ID,
  gold: STRIPE_PRICE_GOLD_ID,
};

const stripe = require("stripe")(STRIPE_PRIVATE_KEY);

if ((!STRIPE_PRIVATE_KEY || !STRIPE_WEBHOOK_SECRET_KEY) && process.env.NODE_ENV !== 'test') {
    logger.error("Missing required environment variables");
    process.exit(1);
  }

class PaymentFacade {
  static verifyWebhookSignature(req) {
    const sig = req.headers["stripe-signature"];
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        STRIPE_WEBHOOK_SECRET_KEY
      );
      return event;
    } catch (err) {
      logger.error("Webhook signature verification failed:", err);
      throw new Error("Invalid Stripe signature");
    }
  }

  static async createCheckoutSession(userId, subscriptionType, promotionCodeId = null) {
    const priceId = priceIdMap[subscriptionType];
    if (!priceId) throw new Error("Invalid subscription type");

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    const activeSub = await Subscription.findOne({
      user_id: userId,
      status_type: "active",
    });

    if (activeSub && activeSub.subscription_type === subscriptionType) {
      throw new Error(`You already have an active ${subscriptionType} subscription.`);
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      allow_promotion_codes: true, // <-- enable promo code field
      customer_email: user.email,
      success_url: `${BACKEND_URL}/api/payments/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/`,
      metadata: { userId, subscriptionType },
    });

    return session.url;
  }

  static async handleCheckoutSessionCompleted(session) {
    const { metadata, subscription: stripeSubscriptionId, payment_status } = session;
    const { userId, subscriptionType } = metadata;

    if (!userId || !subscriptionType || !stripeSubscriptionId || payment_status !== "paid") {
      throw new Error("Missing required metadata or payment not completed.");
    }

    const existing = await Subscription.findOne({ user_id: userId, status_type: "active" });
    if (existing) {
      existing.status_type = "inactive";
      existing.end_date = new Date();
      await existing.save();
    }

    const newSubscription = new Subscription({
      user_id: userId,
      customer_id: session.customer,
      subscription_type: subscriptionType,
      start_date: new Date(),
      status_type: "active",
      stripeSubscriptionId,
      lastPayment: new Date(),
    });

    await newSubscription.save();

    logger.info(`Subscription record and payment created for user ${userId}: ${subscriptionType}`);
  }

  static async handleInvoicePaid(invoice) {
    const stripeSubscriptionId = invoice.subscription;
    if (!stripeSubscriptionId) return;

    const sub = await Subscription.findOne({ stripeSubscriptionId });
    if (sub) {
      sub.lastPayment = new Date(invoice.created * 1000);
      await sub.save();
      await this.createPaymentRecord({
        subscription: sub,
        amount: invoice.amount_paid / 100,
        date: new Date(invoice.created * 1000),
      });
      logger.info(`Payment recorded for subscription ${stripeSubscriptionId}`);
    }
  }

  static async handleInvoicePaymentFailed(invoice) {
    const stripeSubscriptionId = invoice.subscription;
    const customerId = invoice.customer;

    logger.warn(`Payment failed for subscription ${stripeSubscriptionId} (customer: ${customerId})`);

    // Optional: notify user via email, mark as "delinquent", etc.
  }

  static async handleSubscriptionDeleted(subscription) {
    const sub = await Subscription.findOne({ stripeSubscriptionId: subscription.id });
    if (sub) {
      sub.status_type = "inactive";
      sub.end_date = new Date();
      await sub.save();
      logger.info(`Subscription ${subscription.id} marked as inactive`);
    }
  }

  static async updateSubscriptionFromStripe(subscription) {
    const priceId = subscription.items.data[0].price.id;
    const subscriptionType =
      priceId === STRIPE_PRICE_PLATINUM_ID
        ? "platinum"
        : priceId === STRIPE_PRICE_GOLD_ID
        ? "gold"
        : "unknown";

    const updated = await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: subscription.id },
      {
        status_type: subscription.status === "active" ? "active" : "inactive",
        subscription_type: subscriptionType,
        end_date: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000),
      },
      { new: true }
    );

    if (!updated) {
      logger.warn("No subscription found to update for ID:", subscription.id);
    }
  }

  static async downgradeToFreePlan(userId) {
    const newFreeSubscription = new Subscription({
      user_id: userId,
      customer_id: `free-${Date.now()}`,
      subscription_type: "free",
      status_type: "active",
      start_date: new Date(),
    });

    await newFreeSubscription.save();
    logger.info("User downgraded to free plan.");
  }

  static async createBillingPortalSession(userId) {
    const subscription = await Subscription.findOne({
      user_id: userId,
      status_type: "active",
    });
  
    if (!subscription || !subscription.customer_id) {
      throw new Error("No active subscription found for billing portal.");
    }
  
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.customer_id,
      return_url: `${process.env.FRONTEND_URL}/profile`,
    });
  
    return session.url;
  }

  static async handlePaymentSuccess(sessionId) {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
  
    if (!session || session.payment_status !== "paid") {
      throw new Error("Checkout session is not paid or invalid");
    }
  
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    await PaymentFacade.updateSubscriptionFromStripe(subscription);
  
    return {
      message: "Payment successful and subscription activated.",
      subscriptionId: subscription.id,
    };
  }

  static async createPaymentRecord({ subscription, amount, method = "Credit Card", date = new Date() }) {
    const payment = new Payment({
      subscription_id: subscription._id,
      amount,
      payment_method: method,
      payment_date: date,
      status: "Completed",
    });
  
    await payment.save();
    logger.info(`💳 Payment recorded for subscription ${subscription._id}`);
  }
}

module.exports = PaymentFacade;
