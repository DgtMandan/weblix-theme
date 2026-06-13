import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema(
  {
    type: { type: String, required: true, index: true },
    path: String,
    title: String,
    referrer: String,
    device: String,
    userAgent: String,
    ip: String,
    metadata: mongoose.Schema.Types.Mixed
  },
  { timestamps: true }
);

export const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);
