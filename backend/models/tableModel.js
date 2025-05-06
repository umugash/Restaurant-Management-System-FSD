const mongoose = require('mongoose');

const tableSchema = mongoose.Schema(
  {
    tableNumber: {
      type: Number,
      required: true,
      unique: true,
    },
    capacity: {
      type: Number,
      required: true,
      default: 4,
    },
    isOccupied: {
      type: Boolean,
      required: true,
      default: false,
    },
    status: {
      type: String,
      required: true,
      enum: ['available', 'reserved', 'occupied'],
      default: 'available',
    },
    currentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;