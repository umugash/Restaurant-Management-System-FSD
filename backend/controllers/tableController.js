const asyncHandler = require('express-async-handler');
const Table = require('../models/tableModel');

// @desc    Get all tables
// @route   GET /api/tables
// @access  Private
const getTables = asyncHandler(async (req, res) => {
  const tables = await Table.find({}).sort({ tableNumber: 1 });
  res.json(tables);
});

// @desc    Get table by ID
// @route   GET /api/tables/:id
// @access  Private
const getTableById = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);

  if (table) {
    res.json(table);
  } else {
    res.status(404);
    throw new Error('Table not found');
  }
});

// @desc    Create a new table
// @route   POST /api/tables
// @access  Private/Admin
const createTable = asyncHandler(async (req, res) => {
  const { tableNumber, capacity } = req.body;

  const tableExists = await Table.findOne({ tableNumber });

  if (tableExists) {
    res.status(400);
    throw new Error('Table with that number already exists');
  }

  const table = await Table.create({
    tableNumber,
    capacity,
  });

  if (table) {
    res.status(201).json(table);
  } else {
    res.status(400);
    throw new Error('Invalid table data');
  }
});

// @desc    Update table
// @route   PUT /api/tables/:id
// @access  Private/Admin
const updateTable = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);

  if (table) {
    table.tableNumber = req.body.tableNumber || table.tableNumber;
    table.capacity = req.body.capacity || table.capacity;
    table.status = req.body.status || table.status;
    table.isOccupied = req.body.isOccupied !== undefined ? req.body.isOccupied : table.isOccupied;

    const updatedTable = await table.save();
    res.json(updatedTable);
  } else {
    res.status(404);
    throw new Error('Table not found');
  }
});

// @desc    Delete table
// @route   DELETE /api/tables/:id
// @access  Private/Admin
const deleteTable = asyncHandler(async (req, res) => {
  const table = await Table.findById(req.params.id);

  if (table) {
    await table.deleteOne();
    res.json({ message: 'Table removed' });
  } else {
    res.status(404);
    throw new Error('Table not found');
  }
});

module.exports = {
  getTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
};