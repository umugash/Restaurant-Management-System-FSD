const express = require('express');
const { getOrders, getKitchenOrders, getOrderById, createOrder, updateOrder, deleteOrder } = require('../controllers/orderController');
const { protect, admin, waiter, chef } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getOrders)
  .post(protect, waiter, createOrder);

router.route('/kitchen')
  .get(protect, chef, getKitchenOrders);

router.route('/:id')
  .get(protect, getOrderById)
  .put(protect, updateOrder)
  .delete(protect, admin, deleteOrder);

module.exports = router;