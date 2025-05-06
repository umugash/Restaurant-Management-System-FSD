import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import Modal from '../../components/common/Modal';
import { getReservations, getAvailableTables, createReservation, updateReservation, deleteReservation } from '../../services/api';
import moment from 'moment';
import { FaCalendarPlus, FaEdit, FaTrash, FaFilter, FaCalendarAlt, FaPhone } from 'react-icons/fa';

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentReservation, setCurrentReservation] = useState(null);
  const [filterDate, setFilterDate] = useState(moment().format('YYYY-MM-DD'));
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    date: moment().format('YYYY-MM-DD'),
    time: '19:00',
    partySize: 2,
    table: '',
    specialRequests: '',
    status: 'confirmed',
  });
  const [error, setError] = useState('');
  
  // Fetch reservations
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const data = await getReservations(filterDate, filterStatus);
        setReservations(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        setLoading(false);
      }
    };
    
    fetchReservations();
  }, [filterDate, filterStatus]);
  
  // Fetch available tables when date, time or party size changes
  useEffect(() => {
    const fetchAvailableTables = async () => {
      if (formData.date && formData.time) {
        try {
          const tables = await getAvailableTables(
            formData.date, 
            formData.time, 
            formData.partySize
          );
          
          // If editing, include the current table
          if (currentReservation && currentReservation.table) {
            const isCurrentTableIncluded = tables.some(
              table => table._id === currentReservation.table._id
            );
            
            if (!isCurrentTableIncluded) {
              tables.push(currentReservation.table);
            }
          }
          
          setAvailableTables(tables);
        } catch (error) {
          console.error('Error fetching available tables:', error);
        }
      }
    };
    
    fetchAvailableTables();
  }, [formData.date, formData.time, formData.partySize, currentReservation]);
  
  // Handle form input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  
  // Open modal for new reservation
  const handleAddReservation = () => {
    setCurrentReservation(null);
    setFormData({
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      date: moment().format('YYYY-MM-DD'),
      time: '19:00',
      partySize: 2,
      table: '',
      specialRequests: '',
      status: 'confirmed',
    });
    setError('');
    setModalOpen(true);
  };
  
  // Open modal for editing reservation
  const handleEditReservation = (reservation) => {
    setCurrentReservation(reservation);
    setFormData({
      customerName: reservation.customerName,
      customerPhone: reservation.customerPhone,
      customerEmail: reservation.customerEmail || '',
      date: moment(reservation.date).format('YYYY-MM-DD'),
      time: reservation.time,
      partySize: reservation.partySize,
      table: reservation.table._id,
      specialRequests: reservation.specialRequests || '',
      status: reservation.status,
    });
    setError('');
    setModalOpen(true);
  };
  
  // Handle reservation form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.customerName || !formData.customerPhone || !formData.date || !formData.time || !formData.table) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      if (currentReservation) {
        // Update existing reservation
        const updatedReservation = await updateReservation(currentReservation._id, formData);
        
        if (updatedReservation) {
          // Refresh reservations list
          const data = await getReservations(filterDate, filterStatus);
          setReservations(data);
          
          setModalOpen(false);
        }
      } else {
        // Create new reservation
        const newReservation = await createReservation(formData);
        
        if (newReservation) {
          // Refresh reservations list
          const data = await getReservations(filterDate, filterStatus);
          setReservations(data);
          
          setModalOpen(false);
        }
      }
    } catch (error) {
      setError('Failed to save reservation. Please try again.');
    }
  };
  
  // Handle reservation deletion
  const handleDeleteReservation = async (reservationId) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      try {
        const success = await deleteReservation(reservationId);
        
        if (success) {
          // Refresh reservations list
          const data = await getReservations(filterDate, filterStatus);
          setReservations(data);
        }
      } catch (error) {
        console.error('Error deleting reservation:', error);
      }
    }
  };
  
  // Apply filters
  const handleFilterApply = async () => {
    setLoading(true);
    try {
      const data = await getReservations(filterDate, filterStatus);
      setReservations(data);
      setLoading(false);
    } catch (error) {
      console.error('Error applying filters:', error);
      setLoading(false);
    }
  };
  
  // Format time for display
  const formatTime = (time) => {
    return moment(time, 'HH:mm').format('h:mm A');
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="loader-container">
          <div className="loader"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="flex justify-between items-center">
        <h1 className="page-title">Reservation Management</h1>
        <button className="btn" onClick={handleAddReservation}>
          <FaCalendarPlus style={{ marginRight: '8px' }} />
          Add Reservation
        </button>
      </div>
      
      <div className="card">
        <div className="table-filter">
          <div className="filter-group">
            <div className="filter-label">
              <FaCalendarAlt style={{ marginRight: '5px' }} />
              Date:
            </div>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              style={{ width: 'auto' }}
            />
          </div>
          
          <div className="filter-group">
            <div className="filter-label">
              <FaFilter style={{ marginRight: '5px' }} />
              Status:
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="">All</option>
              <option value="confirmed">Confirmed</option>
              <option value="canceled">Canceled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <button className="btn" onClick={handleFilterApply}>Apply Filters</button>
        </div>
        
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Customer</th>
                <th>Party Size</th>
                <th>Table</th>
                <th>Status</th>
                <th>Special Requests</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.length > 0 ? (
                reservations
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((reservation) => (
                    <tr key={reservation._id}>
                      <td>{formatTime(reservation.time)}</td>
                      <td>
                        <div>{reservation.customerName}</div>
                        <div style={{ 
                          fontSize: '0.8rem', 
                          color: '#616161',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}>
                          <FaPhone size={10} />
                          {reservation.customerPhone}
                        </div>
                      </td>
                      <td>{reservation.partySize}</td>
                      <td>Table {reservation.table.tableNumber}</td>
                      <td>
                        <span className={`badge badge-${
                          reservation.status === 'confirmed' ? 'success' : 
                          reservation.status === 'canceled' ? 'error' : 'info'
                        }`}>
                          {reservation.status}
                        </span>
                      </td>
                      <td>{reservation.specialRequests || 'None'}</td>
                      <td>
                        <div className="table-actions">
                          <button 
                            className="btn btn-secondary"
                            onClick={() => handleEditReservation(reservation)}
                            style={{ padding: '6px 10px' }}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="btn btn-error"
                            onClick={() => handleDeleteReservation(reservation._id)}
                            style={{ padding: '6px 10px' }}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center' }}>No reservations found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Reservation Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={currentReservation ? 'Edit Reservation' : 'Add New Reservation'}
      >
        <form onSubmit={handleSubmit}>
          {error && <div className="form-error" style={{ marginBottom: '1rem' }}>{error}</div>}
          }
          
          <div className="form-group">
            <label htmlFor="customerName" className="form-label">Customer Name*</label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              placeholder="Enter customer name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="customerPhone" className="form-label">Phone Number*</label>
            <input
              type="tel"
              id="customerPhone"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="customerEmail" className="form-label">Email</label>
            <input
              type="email"
              id="customerEmail"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              placeholder="Enter email (optional)"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="date" className="form-label">Date*</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                min={moment().format('YYYY-MM-DD')}
              />
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="time" className="form-label">Time*</label>
              <select
                id="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
              >
                <option value="11:00">11:00 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="13:00">1:00 PM</option>
                <option value="14:00">2:00 PM</option>
                <option value="15:00">3:00 PM</option>
                <option value="18:00">6:00 PM</option>
                <option value="19:00">7:00 PM</option>
                <option value="20:00">8:00 PM</option>
                <option value="21:00">9:00 PM</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="partySize" className="form-label">Party Size*</label>
              <input
                type="number"
                id="partySize"
                name="partySize"
                value={formData.partySize}
                onChange={handleChange}
                min="1"
              />
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="table" className="form-label">Table*</label>
              <select
                id="table"
                name="table"
                value={formData.table}
                onChange={handleChange}
              >
                <option value="">Select a table</option>
                {availableTables.map((table) => (
                  <option key={table._id} value={table._id}>
                    Table {table.tableNumber} (Capacity: {table.capacity})
                  </option>
                ))}
              </select>
              {availableTables.length === 0 && (
                <div style={{ color: '#f44336', fontSize: '0.8rem', marginTop: '5px' }}>
                  No tables available for this time slot
                </div>
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="specialRequests" className="form-label">Special Requests</label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              placeholder="Enter any special requests (optional)"
              rows="3"
            ></textarea>
          </div>
          
          {currentReservation && (
            <div className="form-group">
              <label htmlFor="status" className="form-label">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="confirmed">Confirmed</option>
                <option value="canceled">Canceled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          )}
          
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn">
              {currentReservation ? 'Update Reservation' : 'Create Reservation'}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default ReservationManagement;