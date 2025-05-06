const express = require('express');
const { getReservations, getReservationById, createReservation, updateReservation, deleteReservation, getAvailableTables } = require('../controllers/reservationController');
const { protect, admin, receptionist } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, receptionist, getReservations)
  .post(protect, receptionist, createReservation);

router.route('/available-tables')
  .get(protect, receptionist, getAvailableTables);

router.route('/:id')
  .get(protect, receptionist, getReservationById)
  .put(protect, receptionist, updateReservation)
  .delete(protect, receptionist, deleteReservation);

module.exports = router;