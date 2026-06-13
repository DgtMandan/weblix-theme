import crypto from 'crypto';
import { Product } from '../models/Product.js';
import { Template } from '../models/Template.js';
import { Order } from '../models/Order.js';
import { Payment } from '../models/Payment.js';
import { Download } from '../models/Download.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { sendLicenseEmail } from '../services/emailService.js';
import { markCouponUsed, validateCouponForItem } from '../services/couponService.js';
import {
  constructStripeWebhookEvent,
  createProviderOrder,
  createStripeCheckoutSession,
  retrieveStripeCheckoutSession,
  retrieveStripeSubscription
} from '../services/paymentService.js';

async function findItem(type, id) {
  return type === 'product' ? Product.findById(id) : Template.findById(id);
}

function getLicenseMeta(order) {
  if (order.itemType !== 'product') return { licenseType: 'standard' };
  const billingCycle = order.item?.billingCycle || 'one-time';
  const durationDays = Number(order.item?.licenseDurationDays || 0);
  const startsAt = new Date();
  const meta = {
    licenseType: billingCycle === 'lifetime' ? 'lifetime' : billingCycle === 'yearly' ? 'yearly' : 'standard',
    licenseStartsAt: startsAt
  };

  if (billingCycle === 'yearly' || durationDays > 0) {
    const expiresAt = new Date(startsAt);
    expiresAt.setDate(expiresAt.getDate() + (durationDays || 365));
    meta.licenseExpiresAt = expiresAt;
    meta.renewalDueAt = expiresAt;
  }

  return meta;
}

function periodEndFromSubscription(subscription) {
  if (!subscription?.current_period_end) return null;
  return new Date(subscription.current_period_end * 1000);
}

function normalizeSubscriptionStatus(status) {
  if (['active', 'past_due', 'canceled', 'incomplete'].includes(status)) return status;
  if (status === 'trialing') return 'active';
  return 'none';
}

async function ensureDownload(order) {
  const userId = order.user?._id || order.user;
  return Download.findOneAndUpdate(
    { user: userId, order: order._id },
    { user: userId, order: order._id, itemType: order.itemType, item: order.item?._id || order.item },
    { upsert: true, new: true }
  );
}

async function getOrderUser(order) {
  if (order.user?.email) return order.user;
  return User.findById(order.user).select('name email');
}

async function activatePaidOrder(order, payload = {}) {
  const now = new Date();
  order.status = 'paid';
  order.paymentId = payload.paymentId || order.paymentId;
  order.providerSessionId = payload.sessionId || order.providerSessionId;
  order.providerCustomerId = payload.customerId || order.providerCustomerId;
  order.providerSubscriptionId = payload.subscriptionId || order.providerSubscriptionId;
  order.licenseKey = order.licenseKey || `WEBLIX-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
  if (order.coupon && !order.couponMarkedUsedAt) {
    await markCouponUsed(order.coupon);
    order.couponMarkedUsedAt = now;
  }

  if (order.itemType === 'product' && order.item?.billingCycle === 'yearly') {
    const startsAt = order.licenseStartsAt || now;
    const periodEnd = payload.periodEnd || null;
    const expiresAt = periodEnd || new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000);
    order.licenseType = 'yearly';
    order.licenseStartsAt = startsAt;
    order.licenseExpiresAt = expiresAt;
    order.renewalDueAt = expiresAt;
    order.lastRenewedAt = now;
    order.autoRenew = Boolean(order.providerSubscriptionId);
    order.subscriptionStatus = normalizeSubscriptionStatus(payload.subscriptionStatus || (order.autoRenew ? 'active' : 'none'));
    order.cancelAtPeriodEnd = Boolean(payload.cancelAtPeriodEnd);
  } else if (!order.licenseStartsAt) {
    Object.assign(order, getLicenseMeta(order));
  }

  const shouldSendPurchaseEmail = !order.purchaseEmailSentAt;
  const shouldSendRenewalEmail = Boolean(payload.isRenewal && order.purchaseEmailSentAt && payload.paymentId && order.lastEmailPaymentId !== payload.paymentId);
  await order.save();
  const download = await ensureDownload(order);

  if (shouldSendPurchaseEmail || shouldSendRenewalEmail) {
    try {
      const user = await getOrderUser(order);
      await sendLicenseEmail({ order, user, download });
      if (shouldSendPurchaseEmail) order.purchaseEmailSentAt = new Date();
      if (shouldSendRenewalEmail) order.lastRenewalEmailSentAt = new Date();
      order.lastEmailPaymentId = payload.paymentId || order.lastEmailPaymentId;
      await order.save();
    } catch (error) {
      console.error('License email failed:', error.message);
    }
  }

  return download;
}

export const createOrder = asyncHandler(async (req, res) => {
  const { itemType, itemId, provider = 'auto', couponCode } = req.body;
  const item = await findItem(itemType, itemId);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  const couponMeta = couponCode ? await validateCouponForItem({ code: couponCode, itemType, item }) : null;
  const finalAmount = couponMeta?.finalAmount ?? Number(item.price || 0);
  const discountAmount = couponMeta?.discountAmount || 0;

  const receipt = crypto.randomUUID();
  const isYearlyProduct = itemType === 'product' && item.billingCycle === 'yearly';
  const paymentProvider = provider === 'auto'
    ? (isYearlyProduct && process.env.STRIPE_SECRET_KEY ? 'stripe' : 'razorpay')
    : provider;

  const order = await Order.create({
    user: req.user._id,
    itemType,
    item: item._id,
    itemModel: itemType === 'product' ? 'Product' : 'Template',
    originalAmount: item.price,
    discountAmount,
    coupon: couponMeta?.coupon?._id,
    couponCode: couponMeta?.coupon?.code,
    amount: finalAmount,
    currency: 'USD',
    paymentProvider,
    autoRenew: paymentProvider === 'stripe' && isYearlyProduct
  });
  await order.populate('item');

  let providerOrder = null;
  let stripeSession = null;
  if (finalAmount <= 0) {
    providerOrder = { id: `free_${receipt}`, amount: 0, currency: 'USD', status: 'created' };
    order.providerOrderId = providerOrder.id;
    await order.save();
  } else if (paymentProvider === 'stripe' && process.env.STRIPE_SECRET_KEY) {
    stripeSession = await createStripeCheckoutSession({
      order,
      item,
      user: req.user,
      amount: finalAmount,
      successUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout/${order._id}?stripe=success`,
      cancelUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/checkout/${order._id}?stripe=cancel`
    });
    order.providerOrderId = stripeSession.id;
    order.providerSessionId = stripeSession.id;
    await order.save();
  } else {
    providerOrder = await createProviderOrder({
      provider: paymentProvider,
      amount: finalAmount,
      currency: 'USD',
      receipt
    });
    order.providerOrderId = providerOrder.id;
    await order.save();
  }

  res.status(201).json({
    order,
    checkout: {
      provider: paymentProvider,
      amount: finalAmount,
      currency: 'USD',
      providerOrderId: order.providerOrderId,
      providerOrder,
      sessionUrl: stripeSession?.url,
      mode: stripeSession?.mode || (isYearlyProduct ? 'subscription' : 'payment'),
      razorpayKey: paymentProvider === 'razorpay' ? process.env.RAZORPAY_KEY_ID : undefined
    }
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, providerPaymentId, razorpayOrderId, razorpaySignature, status = 'paid' } = req.body;
  const order = await Order.findOne({ _id: orderId, user: req.user._id }).populate('item');
  if (!order) return res.status(404).json({ message: 'Order not found' });

  if (order.paymentProvider === 'razorpay' && process.env.RAZORPAY_SECRET && razorpaySignature) {
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET)
      .update(`${razorpayOrderId || order.providerOrderId}|${providerPaymentId}`)
      .digest('hex');
    if (expected !== razorpaySignature) {
      res.status(400);
      throw new Error('Invalid payment signature');
    }
  }

  order.status = status;
  order.paymentId = providerPaymentId;
  let download = null;
  if (status === 'paid') {
    download = await activatePaidOrder(order, { paymentId: providerPaymentId });
  } else {
    await order.save();
  }

  await Payment.create({
    user: req.user._id,
    order: order._id,
    provider: order.paymentProvider,
    providerPaymentId,
    providerOrderId: order.providerOrderId,
    amount: order.amount,
    currency: order.currency,
    status,
    raw: req.body
  });

  if (!download && status === 'paid') download = await ensureDownload(order);

  res.json({ order, downloadUrl: download ? `/api/downloads/${download._id}` : null });
});

export const syncStripeOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate('item');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.paymentProvider !== 'stripe') return res.status(400).json({ message: 'This order is not a Stripe checkout.' });

  const session = await retrieveStripeCheckoutSession(order.providerSessionId || order.providerOrderId);
  if (!session) return res.status(400).json({ message: 'Stripe session not found.' });

  if (session.payment_status !== 'paid' && session.status !== 'complete') {
    return res.json({ order, paid: false, message: 'Stripe payment is still pending.' });
  }

  let subscription = null;
  if (session.subscription) subscription = await retrieveStripeSubscription(session.subscription);
  const download = await activatePaidOrder(order, {
    paymentId: session.payment_intent || session.subscription || session.id,
    sessionId: session.id,
    customerId: session.customer,
    subscriptionId: session.subscription,
    periodEnd: periodEndFromSubscription(subscription),
    subscriptionStatus: subscription?.status || 'active',
    cancelAtPeriodEnd: subscription?.cancel_at_period_end
  });

  res.json({ order, paid: true, downloadUrl: `/api/downloads/${download._id}` });
});

export const stripeWebhook = asyncHandler(async (req, res) => {
  const event = constructStripeWebhookEvent(req.body, req.headers['stripe-signature']);
  const object = event.data?.object;

  if (event.type === 'checkout.session.completed') {
    const orderId = object.metadata?.orderId || object.client_reference_id;
    const order = await Order.findById(orderId).populate('item');
    if (order) {
      let subscription = null;
      if (object.subscription) subscription = await retrieveStripeSubscription(object.subscription);
      await activatePaidOrder(order, {
        paymentId: object.payment_intent || object.subscription || object.id,
        sessionId: object.id,
        customerId: object.customer,
        subscriptionId: object.subscription,
        periodEnd: periodEndFromSubscription(subscription),
        subscriptionStatus: subscription?.status || 'active',
        cancelAtPeriodEnd: subscription?.cancel_at_period_end
      });
      await Payment.create({
        user: order.user,
        order: order._id,
        provider: 'stripe',
        providerPaymentId: object.payment_intent || object.subscription || object.id,
        providerOrderId: object.id,
        amount: order.amount,
        currency: order.currency,
        status: 'paid',
        raw: event
      });
    }
  }

  if (event.type === 'invoice.paid') {
    const order = await Order.findOne({ providerSubscriptionId: object.subscription }).populate('item');
    if (order) {
      const subscription = await retrieveStripeSubscription(object.subscription);
      await activatePaidOrder(order, {
        paymentId: object.payment_intent || object.id,
        subscriptionId: object.subscription,
        periodEnd: periodEndFromSubscription(subscription),
        subscriptionStatus: subscription?.status || 'active',
        cancelAtPeriodEnd: subscription?.cancel_at_period_end,
        isRenewal: true
      });
      await Payment.create({
        user: order.user,
        order: order._id,
        provider: 'stripe',
        providerPaymentId: object.payment_intent || object.id,
        providerOrderId: object.subscription,
        amount: (object.amount_paid || 0) / 100,
        currency: (object.currency || order.currency).toUpperCase(),
        status: 'paid',
        raw: event
      });
    }
  }

  if (event.type === 'customer.subscription.deleted' || event.type === 'customer.subscription.updated') {
    const order = await Order.findOne({ providerSubscriptionId: object.id });
    if (order) {
      order.subscriptionStatus = normalizeSubscriptionStatus(object.status === 'canceled' ? 'canceled' : object.status || order.subscriptionStatus);
      order.cancelAtPeriodEnd = Boolean(object.cancel_at_period_end);
      order.autoRenew = object.status === 'active' && !object.cancel_at_period_end;
      await order.save();
    }
  }

  res.json({ received: true });
});

export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate('item').sort('-createdAt');
  res.json(orders);
});

export const getMyOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate('item');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

export const allOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate('user', 'name email').populate('item').sort('-createdAt');
  res.json(orders);
});
