import React, { useState, useEffect } from 'react';
import Layout from '../../components/common/Layout';
import DashboardStats from '../../components/common/DashboardStats';
import { useAuth } from '../../contexts/AuthContext';
import { getTables } from '../../services/api';
import { getReservations } from '../../services/api';
import { getOrders } from '../../services/api';
import { getLowStockGroceries } from '../../services/api';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { FaUsers, FaCalendarCheck, FaClipboardList, FaBoxes } from 'react-icons/fa';

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    reservations: 0,
    tables: 0,
    orders: 0,
    lowStock: 0
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch data for dashboard stats
        const tables = await getTables();
        const reservations = await getReservations();
        const orders = await getOrders();
        const lowStockItems = await getLowStockGroceries();
        
        setStats({
          tables: tables.length,
          reservations: reservations.length,
          orders: orders.filter(order => order.status === 'active').length,
          lowStock: lowStockItems.length
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Chart data
  const chartData = {
    labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    datasets: [
      {
        label: 'Reservations',
        data: [5, 7, 10, 8, 12, 20, 15],
        backgroundColor: 'rgba(139, 0, 0, 0.7)',
      },
      {
        label: 'Orders',
        data: [15, 19, 25, 20, 30, 45, 40],
        backgroundColor: 'rgba(255, 152, 0, 0.7)',
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weekly Reservations & Orders',
      },
    },
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
      <h1 className="page-title">Admin Dashboard</h1>
      
      <div className="welcome-message card" style={{ marginBottom: '2rem' }}>
        <h2>Welcome back, {user?.name}!</h2>
        <p>Here's what's happening in your restaurant today.</p>
      </div>
      
      <DashboardStats stats={stats} />
      
      <div className="dashboard-charts grid-cols-2" style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Weekly Performance</h3>
          <Bar data={chartData} options={chartOptions} />
        </div>
        
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
          <div className="grid-cols-2" style={{ display: 'grid', gap: '1rem' }}>
            <a href="/admin/users" className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <FaUsers size={30} style={{ marginBottom: '0.5rem' }} />
              <div>Manage Users</div>
            </a>
            <a href="/admin/reservations" className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <FaCalendarCheck size={30} style={{ marginBottom: '0.5rem' }} />
              <div>View Reservations</div>
            </a>
            <a href="/admin/orders" className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <FaClipboardList size={30} style={{ marginBottom: '0.5rem' }} />
              <div>Check Orders</div>
            </a>
            <a href="/admin/groceries" className="card" style={{ textAlign: 'center', padding: '1.5rem' }}>
              <FaBoxes size={30} style={{ marginBottom: '0.5rem' }} />
              <div>Inventory Status</div>
            </a>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>System Status</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ 
            flex: '1 1 200px', 
            backgroundColor: 'rgba(76, 175, 80, 0.1)', 
            padding: '1rem', 
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{ 
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#4caf50'
            }}></div>
            <span>Database Connected</span>
          </div>
          
          <div style={{ 
            flex: '1 1 200px', 
            backgroundColor: 'rgba(76, 175, 80, 0.1)', 
            padding: '1rem', 
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{ 
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#4caf50'
            }}></div>
            <span>API Server Running</span>
          </div>
          
          <div style={{ 
            flex: '1 1 200px', 
            backgroundColor: 'rgba(76, 175, 80, 0.1)', 
            padding: '1rem', 
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{ 
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#4caf50'
            }}></div>
            <span>Authentication Active</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;