import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Template } from '../models/Template.js';
import { Blog } from '../models/Blog.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const analytics = asyncHandler(async (req, res) => {
  const [users, orders, templates, blogs, paidOrders] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Template.countDocuments(),
    Blog.countDocuments(),
    Order.find({ status: 'paid' })
  ]);
  const revenue = paidOrders.reduce((sum, order) => sum + order.amount, 0);
  res.json({ users, orders, templates, blogs, revenue });
});

export const users = asyncHandler(async (req, res) => {
  res.json(await User.find().select('-password').sort('-createdAt'));
});
