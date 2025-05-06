const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const Table = require('../models/tableModel');

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = asyncHandler(async (req, res) => {
  let filter = {};
  
  // If waiter, only get their orders
  if (req.user.role === 'waiter') {
    filter.waiter = req.user._id;
  }
  
  const orders = await Order.find(filter)
    .populate('table', 'tableNumber')
    .populate('waiter', 'name')
    .sort({ createdAt: -1 });
  
  res.json(orders);
});

// @desc    Get active orders for kitchen
// @route   GET /api/orders/kitchen
// @access  Private/Chef
const getKitchenOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ status: 'active' })
    .populate('table', 'tableNumber')
    .populate('waiter', 'name')
    .sort({ createdAt: 1 });
  
  res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('table', 'tableNumber')
    .populate('waiter', 'name');

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private/Waiter
const createOrder = asyncHandler(async (req, res) => {
  const { table: tableId, items } = req.body;

  if (!tableId || !items || items.length === 0) {
    res.status(400);
    throw new Error('Please add a table and items to the order');
  }

  // Check if table exists and is not occupied
  const table = await Table.findById(tableId);
  if (!table) {
    res.status(404);
    throw new Error('Table not found');
  }

  // Calculate total amount
  const totalAmount = items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  const order = await Order.create({
    table: tableId,
    items,
    totalAmount,
    waiter: req.user._id,
  });

  if (order) {
    // Update table status
    table.status = 'occupied';
    table.isOccupied = true;
    table.currentOrder = order._id;
    await table.save();

    res.status(201).json(order);
  } else {
    res.status(400);
    throw new Error('Invalid order data');
  }
});

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private
const updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Check permissions based on role
    if (req.user.role === 'waiter' && order.waiter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(401);
      throw new Error('Not authorized to update this order');
    }

    if (req.body.items) {
      order.items = req.body.items;
      
      // Recalculate total amount
      order.totalAmount = order.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
      }, 0);
    }

    if (req.body.status) {
      order.status = req.body.status;
      
      // If order is completed or cancelled, update table
      if (order.status === 'completed' || order.status === 'cancelled') {
        const table = await Table.findById(order.table);
        if (table) {
          table.status = 'available';
          table.isOccupied = false;
          table.currentOrder = null;
          await table.save();
        }
      }
    }

    if (req.body.paymentStatus) {
      order.paymentStatus = req.body.paymentStatus;
    }

    if (req.body.paymentMethod) {
      order.paymentMethod = req.body.paymentMethod;
    }

    // Update individual items status (for chef)
    if (req.body.itemUpdates && req.user.role === 'chef') {
      req.body.itemUpdates.forEach(update => {
        const item = order.items.id(update.itemId);
        if (item) {
          item.status = update.status;
        }
      });
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    // Release the table
    const table = await Table.findById(order.table);
    if (table && table.currentOrder && table.currentOrder.toString() === order._id.toString()) {
      table.status = 'available';
      table.isOccupied = false;
      table.currentOrder = null;
      await table.save();
    }

    await order.deleteOne();
    res.json({ message: 'Order removed' });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

module.exports = {
  getOrders,
  getKitchenOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
};