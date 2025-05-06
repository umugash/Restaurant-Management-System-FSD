import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import DashboardStats from '../../components/common/DashboardStats';
import { useAuth } from '../../contexts/AuthContext';
import { getTables } from '../../services/api';
import { getReservations } from '../../services/api';
import { FaCalendarAlt, FaUserClock, FaCalendarCheck } from 'react-icons/fa';
import moment from 'moment';

const ReceptionistDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    reservations: 0,
    tables: 0,
    todayReservations: 0,
    availableTables: 0
  });
  const [todayReservations, setTodayReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch data for dashboard stats
        const tables = await getTables();
        const allReservations = await getReservations();
        
        // Get today's date
        const today = moment().format('YYYY-MM-DD');
        
        // Filter reservations for today
        const reservationsToday = allReservations.filter(
          reservation => moment(reservation.date).format('YYYY-MM-DD') === today
        );
        
        // Count available tables
        const availableTables = tables.filter(table => table.status === 'available').length;
        
        setStats({
          tables: tables.length,
          reservations: allReservations.length,
          todayReservations: reservationsToday.length,
          availableTables: availableTables
        });
        
        setTodayReservations(reservationsToday);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Format reservation time for display
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
      <h1 className="page-title">Receptionist Dashboard</h1>
      
      <div className="welcome-message card" style={{ marginBottom: '2rem' }}>
        <h2>Welcome back, {user?.name}!</h2>
        <p>Here's your overview for today, {moment().format('MMMM D, YYYY')}</p>
      </div>
      
      <div className="dashboard-stats">
        <div className="stat-card reservations">
          <FaCalendarAlt size={30} color="#8b0000" />
          <h3 className="stat-number">{stats.todayReservations}</h3>
          <p className="stat-label">Today's Reservations</p>
        </div>
        
        <div className="stat-card tables">
          <FaUserClock size={30} color="#4caf50" />
          <h3 className="stat-number">{stats.availableTables}</h3>
          <p className="stat-label">Available Tables</p>
        </div>
        
        <div className="stat-card orders">
          <FaCalendarCheck size={30} color="#ff9800" />
          <h3 className="stat-number">{stats.reservations}</h3>
          <p className="stat-label">Total Reservations</p>
        </div>
      </div>
      
      <div className="card">
        <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
          <h2>Today's Reservations</h2>
          <a href="/receptionist/reservations" className="btn">Manage Reservations</a>
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
              </tr>
            </thead>
            <tbody>
              {todayReservations.length > 0 ? (
                todayReservations
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((reservation) => (
                    <tr key={reservation._id}>
                      <td>{formatTime(reservation.time)}</td>
                      <td>
                        <div>{reservation.customerName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#616161' }}>{reservation.customerPhone}</div>
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
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center' }}>No reservations for today</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Quick Actions</h2>
        <div className="grid-cols-2" style={{ display: 'grid', gap: '1rem' }}>
          <a href="/receptionist/reservations" className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <FaCalendarAlt size={30} style={{ marginBottom: '0.5rem' }} />
            <div>Manage Reservations</div>
          </a>
          <a href="/receptionist/calendar" className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
            <FaCalendarCheck size={30} style={{ marginBottom: '0.5rem' }} />
            <div>View Calendar</div>
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default ReceptionistDashboard;