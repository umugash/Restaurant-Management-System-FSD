const express = require('express');
const { getTables, getTableById, createTable, updateTable, deleteTable } = require('../controllers/tableController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getTables)
  .post(protect, admin, createTable);

router.route('/:id')
  .get(protect, getTableById)
  .put(protect, admin, updateTable)
  .delete(protect, admin, deleteTable);

module.exports = router;