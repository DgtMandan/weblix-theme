import mongoose from 'mongoose';

const trendSettingSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global', unique: true },
    enabled: { type: Boolean, default: false },
    frequency: { type: String, enum: ['hourly', '6-hours', 'daily', 'weekly'], default: 'daily' },
    dailyLimit: { type: Number, default: 2 },
    minimumSeoScore: { type: Number, default: 70 },
    autoGenerateImages: { type: Boolean, default: true },
    autoAddFaq: { type: Boolean, default: true },
    autoInternalLinking: { type: Boolean, default: true },
    autoMetaDescription: { type: Boolean, default: true },
    autoSchema: { type: Boolean, default: true },
    country: { type: String, default: 'US' },
    category: { type: String, default: 'Technology' }
  },
  { timestamps: true }
);

export const TrendSetting = mongoose.model('TrendSetting', trendSettingSchema);
