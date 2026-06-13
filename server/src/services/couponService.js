import { Coupon } from '../models/Coupon.js';

export function normalizeCouponCode(code = '') {
  return String(code).trim().toUpperCase();
}

export function calculateDiscount(amount, coupon) {
  const total = Number(amount || 0);
  if (!coupon) return { discountAmount: 0, finalAmount: total };
  const rawDiscount = coupon.discountType === 'fixed'
    ? Number(coupon.discountValue || 0)
    : (total * Number(coupon.discountValue || 0)) / 100;
  const discountAmount = Math.min(total, Math.max(0, Number(rawDiscount.toFixed(2))));
  return {
    discountAmount,
    finalAmount: Math.max(0, Number((total - discountAmount).toFixed(2)))
  };
}

export async function validateCouponForItem({ code, itemType, item }) {
  const couponCode = normalizeCouponCode(code);
  if (!couponCode) return { coupon: null, discountAmount: 0, finalAmount: Number(item.price || 0) };

  const coupon = await Coupon.findOne({ code: couponCode });
  if (!coupon || !coupon.isActive) throw new Error('Coupon is not active.');

  const now = new Date();
  if (coupon.startsAt && coupon.startsAt > now) throw new Error('Coupon is not active yet.');
  if (coupon.expiresAt && coupon.expiresAt < now) throw new Error('Coupon has expired.');
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) throw new Error('Coupon usage limit reached.');
  if (coupon.appliesTo !== 'all' && coupon.appliesTo !== itemType) throw new Error('Coupon does not apply to this item.');
  if (itemType === 'product' && coupon.productBillingCycle !== 'all' && coupon.productBillingCycle !== item.billingCycle) {
    throw new Error('Coupon does not apply to this builder plan.');
  }
  if (Number(item.price || 0) < Number(coupon.minimumAmount || 0)) throw new Error('Order does not meet the coupon minimum amount.');

  return { coupon, ...calculateDiscount(item.price, coupon) };
}

export async function markCouponUsed(couponId) {
  if (!couponId) return;
  await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
}
