import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: String,
    content: { type: String, required: true },
    image: String,
    buttonText: String,
    buttonUrl: String,
    badge: String,
    isActive: { type: Boolean, default: true },
    showOnce: { type: Boolean, default: true },
    startsAt: Date,
    expiresAt: Date
  },
  { timestamps: true }
);

export const Announcement = mongoose.model('Announcement', announcementSchema);
