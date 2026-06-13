import mongoose from 'mongoose';

const hidePrivateFields = (_doc, ret) => {
  delete ret.zipPath;
  return ret;
};

const templateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: String,
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD', enum: ['USD'] },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    tags: [String],
    thumbnail: String,
    previewImages: [String],
    demoUrl: String,
    zipPath: String,
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    toJSON: { transform: hidePrivateFields },
    toObject: { transform: hidePrivateFields }
  }
);

templateSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const Template = mongoose.model('Template', templateSchema);
