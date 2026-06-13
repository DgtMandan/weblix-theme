import express from 'express';
import { applyCouponToOrder } from '../controllers/couponController.js';
import { allOrders, createOrder, getMyOrder, myOrders, syncStripeOrder, verifyPayment } from '../controllers/orderController.js';
import { adminOnly, protect } from '../middleware/auth.js';

export const orderRoutes = express.Router();

orderRoutes.post('/', protect, createOrder);
orderRoutes.post('/:id/coupon', protect, applyCouponToOrder);
orderRoutes.post('/verify', protect, verifyPayment);
orderRoutes.post('/stripe-sync/:id', protect, syncStripeOrder);
orderRoutes.get('/mine', protect, myOrders);
orderRoutes.get('/admin/all', protect, adminOnly, allOrders);
orderRoutes.get('/:id', protect, getMyOrder);
