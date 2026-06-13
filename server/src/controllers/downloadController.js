import fs from 'fs';
import path from 'path';
import { Download } from '../models/Download.js';
import { Product } from '../models/Product.js';
import { Template } from '../models/Template.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifySignedDownloadToken } from '../utils/signedDownload.js';

export const myDownloads = asyncHandler(async (req, res) => {
  const downloads = await Download.find({ user: req.user._id }).populate('order').sort('-createdAt');
  res.json(downloads);
});

export const downloadFile = asyncHandler(async (req, res) => {
  const download = await Download.findOne({ _id: req.params.id, user: req.user._id }).populate('order');
  await sendDownload(download, res);
});

export const downloadEmailFile = asyncHandler(async (req, res) => {
  if (!verifySignedDownloadToken(req.params.token, req.params.id)) {
    return res.status(403).json({ message: 'Download link expired. Please login and download from your dashboard.' });
  }
  const download = await Download.findById(req.params.id).populate('order');
  await sendDownload(download, res);
});

async function sendDownload(download, res) {
  if (!download || download.order.status !== 'paid') return res.status(403).json({ message: 'Download not allowed' });
  if (download.order.licenseExpiresAt && new Date(download.order.licenseExpiresAt) < new Date()) {
    return res.status(403).json({ message: 'License expired. Please renew your yearly license to download updates.' });
  }

  const item = download.itemType === 'product'
    ? await Product.findById(download.item)
    : await Template.findById(download.item);
  if (!item?.zipPath) return res.status(404).json({ message: 'File not found' });

  const absolute = path.resolve(item.zipPath);
  if (!fs.existsSync(absolute)) return res.status(404).json({ message: 'ZIP missing on server' });

  download.count += 1;
  download.lastDownloadedAt = new Date();
  await download.save();
  res.download(absolute);
}
