import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: String,
    discountType: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
    discountValue: { type: Number, required: true, min: 0 },
    appliesTo: { type: String, enum: ['all', 'product', 'template'], default: 'all' },
    productBillingCycle: { type: String, enum: ['all', 'yearly', 'lifetime', 'one-time'], default: 'all' },
    minimumAmount: { type: Number, default: 0 },
    maxUses: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    startsAt: Date,
    expiresAt: Date,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Coupon = mongoose.model('Coupon', couponSchema);
