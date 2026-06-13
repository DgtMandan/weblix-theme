import mongoose from 'mongoose';

const hidePrivateFields = (_doc, ret) => {
  delete ret.zipPath;
  return ret;
};

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    longDescription: String,
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD', enum: ['USD'] },
    compareAtPrice: Number,
    billingCycle: { type: String, enum: ['one-time', 'yearly', 'lifetime'], default: 'one-time' },
    licenseDurationDays: { type: Number, default: 0 },
    features: [String],
    screenshots: [String],
    zipPath: String,
    license: { type: String, default: 'single-site' },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    toJSON: { transform: hidePrivateFields },
    toObject: { transform: hidePrivateFields }
  }
);

export const Product = mongoose.model('Product', productSchema);
