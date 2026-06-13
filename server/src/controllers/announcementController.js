import { Announcement } from '../models/Announcement.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function parseBool(value, fallback = true) {
  if (value === undefined || value === null || value === '') return fallback;
  return value === true || value === 'true';
}

export const activeAnnouncement = asyncHandler(async (req, res) => {
  const now = new Date();
  const announcement = await Announcement.findOne({
    isActive: true,
    $and: [
      { $or: [{ startsAt: { $exists: false } }, { startsAt: null }, { startsAt: { $lte: now } }] },
      { $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gte: now } }] }
    ]
  }).sort('-createdAt');

  res.json(announcement || null);
});

export const listAnnouncements = asyncHandler(async (req, res) => {
  const announcements = await Announcement.find().sort('-createdAt');
  res.json(announcements);
});

export const saveAnnouncement = asyncHandler(async (req, res) => {
  const payload = {
    title: req.body.title,
    subtitle: req.body.subtitle,
    content: req.body.content,
    badge: req.body.badge,
    buttonText: req.body.buttonText,
    buttonUrl: req.body.buttonUrl,
    isActive: parseBool(req.body.isActive, true),
    showOnce: parseBool(req.body.showOnce, true),
    startsAt: req.body.startsAt || undefined,
    expiresAt: req.body.expiresAt || undefined
  };

  if (req.file) payload.image = req.file.path;
  if (!payload.title || !payload.content) return res.status(400).json({ message: 'Title and content are required.' });

  const announcement = req.params.id
    ? await Announcement.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true })
    : await Announcement.create(payload);

  res.status(req.params.id ? 200 : 201).json(announcement);
});

export const deleteAnnouncement = asyncHandler(async (req, res) => {
  await Announcement.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});
