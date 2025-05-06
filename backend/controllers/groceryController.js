const asyncHandler = require('express-async-handler');
const Grocery = require('../models/groceryModel');

// @desc    Get all groceries
// @route   GET /api/groceries
// @access  Private
const getGroceries = asyncHandler(async (req, res) => {
  const groceries = await Grocery.find({})
    .populate('updatedBy', 'name')
    .sort({ category: 1, name: 1 });
  
  res.json(groceries);
});

// @desc    Get grocery by ID
// @route   GET /api/groceries/:id
// @access  Private
const getGroceryById = asyncHandler(async (req, res) => {
  const grocery = await Grocery.findById(req.params.id)
    .populate('updatedBy', 'name');

  if (grocery) {
    res.json(grocery);
  } else {
    res.status(404);
    throw new Error('Item not found');
  }
});

// @desc    Create a new grocery item
// @route   POST /api/groceries
// @access  Private/Admin/Chef
const createGrocery = asyncHandler(async (req, res) => {
  const { name, category, quantity, unit, minQuantity } = req.body;

  if (!name || !category) {
    res.status(400);
    throw new Error('Please add a name and category');
  }

  const groceryExists = await Grocery.findOne({ name });

  if (groceryExists) {
    res.status(400);
    throw new Error('Item already exists');
  }

  const grocery = await Grocery.create({
    name,
    category,
    quantity: quantity || 0,
    unit: unit || 'kg',
    minQuantity: minQuantity || 5,
    updatedBy: req.user._id,
    lastUpdated: Date.now(),
  });

  if (grocery) {
    res.status(201).json(grocery);
  } else {
    res.status(400);
    throw new Error('Invalid grocery data');
  }
});

// @desc    Update grocery
// @route   PUT /api/groceries/:id
// @access  Private/Admin/Chef
const updateGrocery = asyncHandler(async (req, res) => {
  const grocery = await Grocery.findById(req.params.id);

  if (grocery) {
    grocery.name = req.body.name || grocery.name;
    grocery.category = req.body.category || grocery.category;
    grocery.quantity = req.body.quantity !== undefined ? req.body.quantity : grocery.quantity;
    grocery.unit = req.body.unit || grocery.unit;
    grocery.minQuantity = req.body.minQuantity || grocery.minQuantity;
    grocery.updatedBy = req.user._id;
    grocery.lastUpdated = Date.now();

    const updatedGrocery = await grocery.save();
    res.json(updatedGrocery);
  } else {
    res.status(404);
    throw new Error('Item not found');
  }
});

// @desc    Delete grocery
// @route   DELETE /api/groceries/:id
// @access  Private/Admin
const deleteGrocery = asyncHandler(async (req, res) => {
  const grocery = await Grocery.findById(req.params.id);

  if (grocery) {
    await grocery.deleteOne();
    res.json({ message: 'Item removed' });
  } else {
    res.status(404);
    throw new Error('Item not found');
  }
});

// @desc    Get low stock groceries
// @route   GET /api/groceries/low-stock
// @access  Private/Admin/Chef
const getLowStockGroceries = asyncHandler(async (req, res) => {
  const groceries = await Grocery.find({})
    .populate('updatedBy', 'name');
  
  const lowStock = groceries.filter(item => item.quantity <= item.minQuantity);
  
  res.json(lowStock);
});

module.exports = {
  getGroceries,
  getGroceryById,
  createGrocery,
  updateGrocery,
  deleteGrocery,
  getLowStockGroceries,
};