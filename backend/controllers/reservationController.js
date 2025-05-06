const asyncHandler = require('express-async-handler');
const Reservation = require('../models/reservationModel');
const Table = require('../models/tableModel');

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private/Admin/Receptionist
const getReservations = asyncHandler(async (req, res) => {
  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Default filter for today's reservations
  let filter = { date: { $gte: today } };
  
  // If date query param is provided, filter by that date
  if (req.query.date) {
    const queryDate = new Date(req.query.date);
    queryDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(queryDate);
    nextDay.setDate(nextDay.getDate() + 1);
    
    filter = { 
      date: { 
        $gte: queryDate,
        $lt: nextDay
      } 
    };
  }
  
  // If status is provided, filter by status
  if (req.query.status) {
    filter.status = req.query.status;
  }
  
  const reservations = await Reservation.find(filter)
    .populate('table', 'tableNumber capacity')
    .populate('createdBy', 'name')
    .sort({ date: 1, time: 1 });
  
  res.json(reservations);
});

// @desc    Get reservation by ID
// @route   GET /api/reservations/:id
// @access  Private
const getReservationById = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id)
    .populate('table', 'tableNumber capacity')
    .populate('createdBy', 'name');

  if (reservation) {
    res.json(reservation);
  } else {
    res.status(404);
    throw new Error('Reservation not found');
  }
});

// @desc    Create a new reservation
// @route   POST /api/reservations
// @access  Private/Admin/Receptionist
const createReservation = asyncHandler(async (req, res) => {
  const { customerName, customerPhone, customerEmail, date, time, partySize, table: tableId, specialRequests } = req.body;

  if (!customerName || !customerPhone || !date || !time || !partySize || !tableId) {
    res.status(400);
    throw new Error('Please add all required fields');
  }

  // Check if table exists
  const table = await Table.findById(tableId);
  if (!table) {
    res.status(404);
    throw new Error('Table not found');
  }

  // Check if the table is already reserved for this time
  const reservationDate = new Date(date);
  reservationDate.setHours(0, 0, 0, 0);
  
  const nextDay = new Date(reservationDate);
  nextDay.setDate(nextDay.getDate() + 1);
  
  const existingReservation = await Reservation.findOne({
    table: tableId,
    date: { 
      $gte: reservationDate,
      $lt: nextDay
    },
    time,
    status: 'confirmed',
  });

  if (existingReservation) {
    res.status(400);
    throw new Error('Table is already reserved for this time');
  }

  const reservation = await Reservation.create({
    customerName,
    customerPhone,
    customerEmail: customerEmail || '',
    date: reservationDate,
    time,
    partySize,
    table: tableId,
    specialRequests: specialRequests || '',
    createdBy: req.user._id,
  });

  if (reservation) {
    res.status(201).json(reservation);
  } else {
    res.status(400);
    throw new Error('Invalid reservation data');
  }
});

// @desc    Update reservation
// @route   PUT /api/reservations/:id
// @access  Private/Admin/Receptionist
const updateReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);

  if (reservation) {
    // If updating date, time, or table, check availability
    if ((req.body.date && req.body.date !== reservation.date.toISOString().split('T')[0]) || 
        (req.body.time && req.body.time !== reservation.time) || 
        (req.body.table && req.body.table !== reservation.table.toString())) {
      
      const tableId = req.body.table || reservation.table;
      const reservationDate = req.body.date ? new Date(req.body.date) : reservation.date;
      reservationDate.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(reservationDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const time = req.body.time || reservation.time;
      
      const existingReservation = await Reservation.findOne({
        _id: { $ne: req.params.id }, // Exclude current reservation
        table: tableId,
        date: { 
          $gte: reservationDate,
          $lt: nextDay
        },
        time,
        status: 'confirmed',
      });

      if (existingReservation) {
        res.status(400);
        throw new Error('Table is already reserved for this time');
      }
      
      // Check if table exists if changing table
      if (req.body.table) {
        const table = await Table.findById(req.body.table);
        if (!table) {
          res.status(404);
          throw new Error('Table not found');
        }
      }
    }

    // Update the reservation
    reservation.customerName = req.body.customerName || reservation.customerName;
    reservation.customerPhone = req.body.customerPhone || reservation.customerPhone;
    reservation.customerEmail = req.body.customerEmail || reservation.customerEmail;
    
    if (req.body.date) {
      const newDate = new Date(req.body.date);
      newDate.setHours(0, 0, 0, 0);
      reservation.date = newDate;
    }
    
    reservation.time = req.body.time || reservation.time;
    reservation.partySize = req.body.partySize || reservation.partySize;
    
    if (req.body.table) {
      reservation.table = req.body.table;
    }
    
    reservation.status = req.body.status || reservation.status;
    reservation.specialRequests = req.body.specialRequests !== undefined ? req.body.specialRequests : reservation.specialRequests;

    const updatedReservation = await reservation.save();
    res.json(updatedReservation);
  } else {
    res.status(404);
    throw new Error('Reservation not found');
  }
});

// @desc    Delete reservation
// @route   DELETE /api/reservations/:id
// @access  Private/Admin/Receptionist
const deleteReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);

  if (reservation) {
    await reservation.deleteOne();
    res.json({ message: 'Reservation removed' });
  } else {
    res.status(404);
    throw new Error('Reservation not found');
  }
});

// @desc    Get available tables for reservation
// @route   GET /api/reservations/available-tables
// @access  Private/Admin/Receptionist
const getAvailableTables = asyncHandler(async (req, res) => {
  const { date, time, partySize } = req.query;
  
  if (!date || !time) {
    res.status(400);
    throw new Error('Please provide date and time');
  }
  
  // Get all tables
  const tables = await Table.find({}).sort({ tableNumber: 1 });
  
  // Get all reservations for the specified date and time
  const reservationDate = new Date(date);
  reservationDate.setHours(0, 0, 0, 0);
  
  const nextDay = new Date(reservationDate);
  nextDay.setDate(nextDay.getDate() + 1);
  
  const reservations = await Reservation.find({
    date: { 
      $gte: reservationDate,
      $lt: nextDay
    },
    time,
    status: 'confirmed',
  });
  
  // Filter out tables that are already reserved
  const reservedTableIds = reservations.map(reservation => reservation.table.toString());
  
  let availableTables = tables.filter(table => !reservedTableIds.includes(table._id.toString()));
  
  // Filter by party size if provided
  if (partySize) {
    availableTables = availableTables.filter(table => table.capacity >= parseInt(partySize));
  }
  
  res.json(availableTables);
});

module.exports = {
  getReservations,
  getReservationById,
  createReservation,
  updateReservation,
  deleteReservation,
  getAvailableTables,
};