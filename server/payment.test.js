jest.mock('stripe');
jest.mock('./model/User');
jest.mock('./model/Subscription');
jest.mock('./model/Payment');
jest.mock('./stripeLogger', () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
}));

const stripe = require('stripe');
const User = require('./model/User');
const Subscription = require('./model/Subscription');
const Payment = require('./model/Payment');

process.env.STRIPE_PRICE_PLATINUM_ID = 'price_platinum_test_id';
process.env.STRIPE_PRICE_GOLD_ID = 'price_gold_test_id';
const PaymentFacade = require('./services/PaymentFacade');

const mockStripe = {
    checkout: {
      sessions: {
        create: jest.fn(),
        retrieve: jest.fn(),
      },
    },
    subscriptions: {
      retrieve: jest.fn(),
    },
    billingPortal: {
      sessions: {
        create: jest.fn(),
      },
    },
  };

stripe.mockImplementation(() => mockStripe);

describe('PaymentFacade', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createCheckoutSession', () => {
        it('should create a checkout session successfully', async () => {
            const userId = 'user123';
            const user = { _id: userId, email: 'test@example.com' };
            User.findById.mockResolvedValue(user);
            Subscription.findOne.mockResolvedValue(null);
            mockStripe.checkout.sessions.create.mockResolvedValue({ url: 'https://checkout.stripe.com' });

            const result = await PaymentFacade.createCheckoutSession(userId, 'platinum');
            expect(result).toBe('https://checkout.stripe.com');
            expect(mockStripe.checkout.sessions.create).toHaveBeenCalled();
        });

        it('should throw if subscription already active', async () => {
            const userId = 'user123';
            User.findById.mockResolvedValue({ _id: userId, email: 'test@example.com' });
            Subscription.findOne.mockResolvedValue({ subscription_type: 'platinum' });

            await expect(PaymentFacade.createCheckoutSession(userId, 'platinum')).rejects.toThrow(
                'You already have an active platinum subscription.'
            );
        });
    });

    describe('handleCheckoutSessionCompleted', () => {
        it('should create subscription and payment record', async () => {
            const session = {
                metadata: { userId: 'user123', subscriptionType: 'gold' },
                subscription: 'sub_123',
                payment_status: 'paid',
                customer: 'cus_123',
                amount_total: 2000,
                created: 1717000000,
            };

            Subscription.findOne.mockResolvedValue(null);
            Subscription.prototype.save = jest.fn();
            Payment.prototype.save = jest.fn();

            await PaymentFacade.handleCheckoutSessionCompleted(session);
            expect(Subscription.prototype.save).toHaveBeenCalled();
            expect(Payment.prototype.save).toHaveBeenCalled();
        });
    });

    describe('handleInvoicePaid', () => {
        it('should update lastPayment and create payment record', async () => {
            const invoice = {
                subscription: 'sub_123',
                amount_paid: 3000,
                created: 1717001000,
            };

            const mockSubscription = {
                _id: 'sub-id',
                lastPayment: null,
                save: jest.fn(),
            };

            Subscription.findOne.mockResolvedValue(mockSubscription);
            Payment.prototype.save = jest.fn();

            await PaymentFacade.handleInvoicePaid(invoice);
            expect(mockSubscription.save).toHaveBeenCalled();
            expect(Payment.prototype.save).toHaveBeenCalled();
        });
    });

    describe('createPaymentRecord', () => {
        it('should save a payment record', async () => {
            const subscription = { _id: 'sub123' };
            Payment.prototype.save = jest.fn();

            await PaymentFacade.createPaymentRecord({
                subscription,
                amount: 29.99,
                method: 'Credit Card',
                date: new Date(),
            });

            expect(Payment.prototype.save).toHaveBeenCalled();
        });
    });
});
