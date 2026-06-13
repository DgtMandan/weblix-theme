import Razorpay from 'razorpay';
import Stripe from 'stripe';

function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export async function createProviderOrder({ provider, amount, currency, receipt }) {
  if (provider === 'razorpay' && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_SECRET) {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET
    });
    return razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt
    });
  }

  return {
    id: `dev_${receipt}`,
    amount: Math.round(amount * 100),
    currency,
    status: 'created'
  };
}

export async function createStripeCheckoutSession({ order, item, user, successUrl, cancelUrl, amount }) {
  const stripe = getStripe();
  if (!stripe) return null;

  const yearly = item.billingCycle === 'yearly';
  const unitAmount = Math.round(Number(amount ?? order.amount ?? item.price) * 100);
  const session = await stripe.checkout.sessions.create({
    mode: yearly ? 'subscription' : 'payment',
    payment_method_types: ['card'],
    customer_email: user.email,
    client_reference_id: order._id.toString(),
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      orderId: order._id.toString(),
      itemType: order.itemType,
      itemId: item._id.toString()
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: order.currency.toLowerCase(),
          unit_amount: unitAmount,
          product_data: {
            name: item.name,
            description: item.description || 'Weblix digital product license'
          },
          ...(yearly ? { recurring: { interval: 'year' } } : {})
        }
      }
    ],
    ...(yearly
      ? {
          subscription_data: {
            metadata: {
              orderId: order._id.toString(),
              userId: user._id.toString(),
              itemId: item._id.toString()
            }
          }
        }
      : {})
  });

  return session;
}

export async function retrieveStripeCheckoutSession(sessionId) {
  const stripe = getStripe();
  if (!stripe || !sessionId) return null;
  return stripe.checkout.sessions.retrieve(sessionId);
}

export async function retrieveStripeSubscription(subscriptionId) {
  const stripe = getStripe();
  if (!stripe || !subscriptionId) return null;
  return stripe.subscriptions.retrieve(subscriptionId);
}

export function constructStripeWebhookEvent(rawBody, signature) {
  const stripe = getStripe();
  if (!stripe) throw new Error('Stripe is not configured');
  if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
    return stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET);
  }
  return JSON.parse(rawBody.toString('utf8'));
}
