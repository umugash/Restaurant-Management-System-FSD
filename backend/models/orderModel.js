const mongoose = require('mongoose');

const orderItemSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['ordered', 'preparing', 'ready', 'served', 'cancelled'],
      default: 'ordered',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const orderSchema = mongoose.Schema(
  {
    table: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Table',
    },
    items: [orderItemSchema],
    status: {
      type: String,
      required: true,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    waiter: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['pending', 'paid', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online', ''],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;