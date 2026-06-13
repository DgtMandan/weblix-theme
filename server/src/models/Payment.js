import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    provider: { type: String, enum: ['stripe', 'razorpay'], required: true },
    providerPaymentId: String,
    providerOrderId: String,
    amount: Number,
    currency: String,
    status: String,
    raw: Object
  },
  { timestamps: true }
);

export const Payment = mongoose.model('Payment', paymentSchema);
