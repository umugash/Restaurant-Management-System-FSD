import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import { getReservations } from '../../services/api';
import moment from 'moment';
import { FaChevronLeft, FaChevronRight, FaCalendarDay, FaUserFriends } from 'react-icons/fa';

const ReservationCalendar = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(moment());
  const [daysInMonth, setDaysInMonth] = useState([]);
  
  // Generate days for the current month view
  useEffect(() => {
    const generateDays = () => {
      const startDay = moment(currentMonth).startOf('month').startOf('week');
      const endDay = moment(currentMonth).endOf('month').endOf('week');
      
      const days = [];
      let day = startDay.clone();
      
      while (day.isSameOrBefore(endDay, 'day')) {
        days.push(day.clone());
        day.add(1, 'day');
      }
      
      return days;
    };
    
    setDaysInMonth(generateDays());
  }, [currentMonth]);
  
  // Fetch reservations for the current month
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const monthStart = moment(currentMonth).startOf('month').format('YYYY-MM-DD');
        const monthEnd = moment(currentMonth).endOf('month').format('YYYY-MM-DD');
        
        // Fetch reservations for this month and next month to ensure we have data for all visible days
        const data = await getReservations(monthStart);
        const nextMonthData = await getReservations(monthEnd);
        
        setReservations([...data, ...nextMonthData]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        setLoading(false);
      }
    };
    
    fetchReservations();
  }, [currentMonth]);
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(moment(currentMonth).subtract(1, 'month'));
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    setCurrentMonth(moment(currentMonth).add(1, 'month'));
  };
  
  // Get reservations for a specific day
  const getReservationsForDay = (day) => {
    const dayFormatted = day.format('YYYY-MM-DD');
    return reservations.filter(reservation => 
      moment(reservation.date).format('YYYY-MM-DD') === dayFormatted
    );
  };
  
  // Format time for display
  const formatTime = (time) => {
    return moment(time, 'HH:mm').format('h:mm A');
  };
  
  // Check if day is in current month
  const isCurrentMonth = (day) => {
    return day.month() === currentMonth.month();
  };
  
  // Check if day is today
  const isToday = (day) => {
    return day.isSame(moment(), 'day');
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
      <h1 className="page-title">Reservation Calendar</h1>
      
      <div className="card">
        <div className="calendar-header">
          <h2 className="calendar-title">{currentMonth.format('MMMM YYYY')}</h2>
          <div className="calendar-nav">
            <button className="btn btn-secondary" onClick={goToPreviousMonth}>
              <FaChevronLeft />
            </button>
            <button 
              className="btn"
              onClick={() => setCurrentMonth(moment())}
              style={{ margin: '0 10px' }}
            >
              Today
            </button>
            <button className="btn btn-secondary" onClick={goToNextMonth}>
              <FaChevronRight />
            </button>
          </div>
        </div>
        
        <div className="calendar-grid">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="calendar-day-header" style={{ 
              fontWeight: 'bold',
              textAlign: 'center',
              padding: '10px',
              backgroundColor: 'var(--secondary-color)',
              borderRadius: 'var(--border-radius) var(--border-radius) 0 0'
            }}>
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {daysInMonth.map(day => {
            const dayReservations = getReservationsForDay(day);
            const isCurrentMonthDay = isCurrentMonth(day);
            const isTodayDay = isToday(day);
            
            return (
              <div key={day.format('YYYY-MM-DD')} 
                className="calendar-day"
                style={{
                  backgroundColor: isTodayDay ? 'rgba(139, 0, 0, 0.05)' : 'var(--card-bg)',
                  opacity: isCurrentMonthDay ? 1 : 0.5,
                  border: isTodayDay ? '2px solid var(--primary-color)' : '1px solid var(--gray-light)'
                }}
              >
                <div className="calendar-day-header" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span className="day-number">{day.format('D')}</span>
                  {dayReservations.length > 0 && (
                    <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FaUserFriends size={10} />
                      {dayReservations.length}
                    </span>
                  )}
                </div>
                
                <div className="day-reservations">
                  {dayReservations.slice(0, 3).map(reservation => (
                    <div key={reservation._id} className="day-reservation" title={reservation.customerName}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{formatTime(reservation.time)}</span>
                        <span>T{reservation.table.tableNumber}</span>
                      </div>
                      <div style={{ 
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontSize: '0.8rem'
                      }}>
                        {reservation.customerName}
                      </div>
                    </div>
                  ))}
                  
                  {dayReservations.length > 3 && (
                    <div style={{ 
                      textAlign: 'center',
                      fontSize: '0.8rem',
                      marginTop: '5px',
                      color: 'var(--primary-color)'
                    }}>
                      + {dayReservations.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Today's Reservations</h2>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Customer</th>
                <th>Party Size</th>
                <th>Table</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {getReservationsForDay(moment()).length > 0 ? (
                getReservationsForDay(moment())
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map(reservation => (
                    <tr key={reservation._id}>
                      <td>{formatTime(reservation.time)}</td>
                      <td>
                        <div>{reservation.customerName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#616161' }}>
                          {reservation.customerPhone}
                        </div>
                      </td>
                      <td style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaUserFriends />
                        {reservation.partySize}
                      </td>
                      <td>Table {reservation.table.tableNumber}</td>
                      <td>
                        <span className={`badge badge-${
                          reservation.status === 'confirmed' ? 'success' : 
                          reservation.status === 'canceled' ? 'error' : 'info'
                        }`}>
                          {reservation.status}
                        </span>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>No reservations for today</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default ReservationCalendar;