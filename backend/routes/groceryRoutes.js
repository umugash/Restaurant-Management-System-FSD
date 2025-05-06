const express = require('express');
const { getGroceries, getGroceryById, createGrocery, updateGrocery, deleteGrocery, getLowStockGroceries } = require('../controllers/groceryController');
const { protect, admin, chef } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getGroceries)
  .post(protect, chef, createGrocery);

router.route('/low-stock')
  .get(protect, chef, getLowStockGroceries);

router.route('/:id')
  .get(protect, getGroceryById)
  .put(protect, chef, updateGrocery)
  .delete(protect, admin, deleteGrocery);

module.exports = router;