import mongoose from 'mongoose';

const downloadSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    itemType: { type: String, enum: ['product', 'template'], required: true },
    item: { type: mongoose.Schema.Types.ObjectId, required: true },
    count: { type: Number, default: 0 },
    lastDownloadedAt: Date
  },
  { timestamps: true }
);

export const Download = mongoose.model('Download', downloadSchema);
