import crypto from 'crypto';
import { Coupon } from '../models/Coupon.js';
import { Order } from '../models/Order.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { createProviderOrder, createStripeCheckoutSession } from '../services/paymentService.js';
import { normalizeCouponCode, validateCouponForItem } from '../services/couponService.js';
import { clientUrl } from '../config/urls.js';

export const listCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort('-createdAt');
  res.json(coupons);
});

export const saveCoupon = asyncHandler(async (req, res) => {
  const body = req.body;
  const payload = {
    code: normalizeCouponCode(body.code),
    description: body.description,
    discountType: body.discountType,
    discountValue: Number(body.discountValue),
    appliesTo: body.appliesTo || 'all',
    productBillingCycle: body.productBillingCycle || 'all',
    minimumAmount: Number(body.minimumAmount || 0),
    maxUses: Number(body.maxUses || 0),
    startsAt: body.startsAt || undefined,
    expiresAt: body.expiresAt || undefined,
    isActive: body.isActive !== false
  };

  if (!payload.code) return res.status(400).json({ message: 'Coupon code is required.' });
  if (!payload.discountValue || payload.discountValue <= 0) return res.status(400).json({ message: 'Discount value must be greater than zero.' });
  if (payload.discountType === 'percent' && payload.discountValue > 100) return res.status(400).json({ message: 'Percent discount cannot exceed 100%.' });

  const coupon = req.params.id
    ? await Coupon.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true })
    : await Coupon.findOneAndUpdate({ code: payload.code }, payload, { upsert: true, new: true, runValidators: true });

  res.status(req.params.id ? 200 : 201).json(coupon);
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

export const applyCouponToOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate('item');
  if (!order) return res.status(404).json({ message: 'Order not found.' });
  if (order.status !== 'pending') return res.status(400).json({ message: 'Coupon can only be applied before payment.' });

  const { coupon, discountAmount, finalAmount } = await validateCouponForItem({
    code: req.body.code,
    itemType: order.itemType,
    item: order.item
  });

  order.originalAmount = order.item.price;
  order.discountAmount = discountAmount;
  order.amount = finalAmount;
  order.coupon = coupon?._id;
  order.couponCode = coupon?.code;

  if (finalAmount > 0) {
    if (order.paymentProvider === 'stripe' && process.env.STRIPE_SECRET_KEY) {
      const session = await createStripeCheckoutSession({
        order,
        item: order.item,
        user: req.user,
        amount: finalAmount,
        successUrl: `${clientUrl()}/checkout/${order._id}?stripe=success`,
        cancelUrl: `${clientUrl()}/checkout/${order._id}?stripe=cancel`
      });
      order.providerOrderId = session.id;
      order.providerSessionId = session.id;
      await order.save();
      return res.json({
        order,
        checkout: {
          provider: 'stripe',
          amount: finalAmount,
          currency: order.currency,
          providerOrderId: order.providerOrderId,
          sessionUrl: session.url,
          mode: session.mode
        }
      });
    }

    const providerOrder = await createProviderOrder({
      provider: order.paymentProvider,
      amount: finalAmount,
      currency: order.currency,
      receipt: crypto.randomUUID?.() || `${Date.now()}`
    });
    order.providerOrderId = providerOrder.id;
    await order.save();
    return res.json({
      order,
      checkout: {
        provider: order.paymentProvider,
        amount: finalAmount,
        currency: order.currency,
        providerOrderId: order.providerOrderId,
        providerOrder,
        razorpayKey: order.paymentProvider === 'razorpay' ? process.env.RAZORPAY_KEY_ID : undefined
      }
    });
  }

  order.providerOrderId = `free_${order._id}`;
  await order.save();
  res.json({
    order,
    checkout: {
      provider: order.paymentProvider,
      amount: 0,
      currency: order.currency,
      providerOrderId: order.providerOrderId,
      providerOrder: { id: order.providerOrderId, amount: 0, currency: order.currency, status: 'created' }
    }
  });
});
