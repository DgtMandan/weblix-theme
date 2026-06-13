import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    type: { type: String, enum: ['template', 'blog'], required: true }
  },
  { timestamps: true }
);

export const Category = mongoose.model('Category', categorySchema);
