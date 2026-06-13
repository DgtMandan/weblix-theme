import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemType: { type: String, enum: ['product', 'template'], required: true },
    item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'itemModel' },
    itemModel: { type: String, enum: ['Product', 'Template'], required: true },
    originalAmount: Number,
    discountAmount: { type: Number, default: 0 },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    couponCode: String,
    couponMarkedUsedAt: Date,
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    paymentProvider: { type: String, enum: ['stripe', 'razorpay'], default: 'razorpay' },
    paymentId: String,
    providerOrderId: String,
    providerSessionId: String,
    providerCustomerId: String,
    providerSubscriptionId: String,
    subscriptionStatus: {
      type: String,
      enum: ['none', 'active', 'past_due', 'canceled', 'incomplete'],
      default: 'none'
    },
    autoRenew: { type: Boolean, default: false },
    cancelAtPeriodEnd: { type: Boolean, default: false },
    licenseKey: String,
    licenseType: { type: String, enum: ['standard', 'yearly', 'lifetime'], default: 'standard' },
    licenseStartsAt: Date,
    licenseExpiresAt: Date,
    renewalDueAt: Date,
    lastRenewedAt: Date,
    purchaseEmailSentAt: Date,
    lastRenewalEmailSentAt: Date,
    lastEmailPaymentId: String
  },
  { timestamps: true }
);

export const Order = mongoose.model('Order', orderSchema);
